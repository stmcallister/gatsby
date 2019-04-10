const chokidar = require(`chokidar`)
const _ = require(`lodash`)
const fs = require(`fs-extra`)
const path = require(`path`)

const {
  publishPackagesLocallyAndInstall,
} = require(`./local-npm-registry/verdaccio`)
const { checkDepsChanges } = require(`./utils/check-deps-changes`)
const { getDependantPackages } = require(`./utils/get-dependant-packages`)
const { promisifiedSpawn } = require(`./utils/promisified-spawn`)
const { traversePackagesDeps } = require(`./utils/traverse-package-deps`)

let numCopied = 0

const quit = () => {
  console.log(`Copied ${numCopied} files`)
  process.exit()
}

/*
 * non-existant packages break on('ready')
 * See: https://github.com/paulmillr/chokidar/issues/449
 */
function watch(root, packages, { scanOnce, quiet, monoRepoPackages }) {
  let afterPackageInstallation = false
  let queuedCopies = []

  const realCopyPath = ({ oldPath, newPath, quiet, resolve, reject }) => {
    fs.copy(oldPath, newPath, err => {
      if (err) {
        console.error(err)
        return reject(err)
      }

      numCopied += 1
      if (!quiet) {
        console.log(`Copied ${oldPath} to ${newPath}`)
      }
      return resolve()
    })
  }

  const copyPath = (oldPath, newPath, quiet) =>
    new Promise((resolve, reject) => {
      const argObj = { oldPath, newPath, quiet, resolve, reject }
      if (afterPackageInstallation) {
        realCopyPath(argObj)
      } else {
        queuedCopies.push(argObj)
      }
    })

  const runQueuedCopies = () => {
    afterPackageInstallation = true
    queuedCopies.forEach(argObj => realCopyPath(argObj))
    queuedCopies = []
  }
  // check packages deps and if they depend on other packages from monorepo
  // add them to packages list
  const { seenPackages: allPackagesToWatch, depTree } = traversePackagesDeps({
    root,
    packages,
    monoRepoPackages,
  })

  if (allPackagesToWatch.length === 0) {
    console.error(`There are no packages to watch.`)
    return
  }

  const ignored = [
    /[/\\]node_modules[/\\]/i,
    /\.git/i,
    /\.DS_Store/,
    /[/\\]__tests__[/\\]/i,
  ].concat(
    allPackagesToWatch.map(p => new RegExp(`${p}[\\/\\\\]src[\\/\\\\]`, `i`))
  )
  const watchers = _.uniq(
    allPackagesToWatch
      .map(p => path.join(root, `/packages/`, p))
      .filter(p => fs.existsSync(p))
  )

  let allCopies = []
  const packagesToPublish = new Set()
  let isInitialScan = true
  let ignoredPackageJSON = new Map()
  const waitFor = new Set()
  let anyPackageNotInstalled = false

  const ignorePackageJSONChanges = (packageName, contentArray) => {
    ignoredPackageJSON.set(packageName, contentArray)

    return () => {
      ignoredPackageJSON.delete(ignoredPackageJSON)
    }
  }

  const watchEvents = [`change`, `add`]

  chokidar
    .watch(watchers, {
      ignored: [filePath => _.some(ignored, reg => reg.test(filePath))],
    })
    .on(`all`, async (event, filePath) => {
      if (!watchEvents.includes(event)) {
        return
      }

      const [packageName] = filePath
        .split(/packages[/\\]/)
        .pop()
        .split(/[/\\]/)
      const prefix = path.join(root, `/packages/`, packageName)

      // Copy it over local version.
      // Don't copy over the Gatsby bin file as that breaks the NPM symlink.
      if (_.includes(filePath, `dist/gatsby-cli.js`)) {
        return
      }

      const relativePackageFile = path.relative(prefix, filePath)

      const newPath = path.join(
        `./node_modules/${packageName}`,
        relativePackageFile
      )

      if (relativePackageFile === `package.json`) {
        // Compare dependencies with local version

        const didDepsChangedPromise = checkDepsChanges({
          newPath,
          packageName,
          monoRepoPackages,
          root,
          isInitialScan,
          ignoredPackageJSON,
        })

        if (isInitialScan) {
          // normally checkDepsChanges would be sync,
          // but because it also can do async GET request
          // to unpkg if local package is not installed
          // keep track of it to make sure all of it
          // finish before installing

          waitFor.add(didDepsChangedPromise)
        }

        const {
          didDepsChanged,
          packageNotInstalled,
        } = await didDepsChangedPromise

        if (packageNotInstalled) {
          anyPackageNotInstalled = true
        }

        if (didDepsChanged) {
          if (isInitialScan) {
            waitFor.delete(didDepsChangedPromise)
            // handle dependency change only in initial scan - this is for sure doable to
            // handle this in watching mode correctly - but for the sake of shipping
            // this I limit more work/time consuming edge cases.

            // Dependency changed - now we need to figure out
            // the packages that actually need to be published.
            // If package with changed dependencies is dependency of other
            // gatsby package - like for example `gatsby-plugin-page-creator`
            // we need to publish both `gatsby-plugin-page-creator` and `gatsby`
            // and install `gatsby` in example site project.
            getDependantPackages({
              packageName,
              depTree,
              packages,
            }).forEach(packageToPublish => {
              // scheduling publish - we will publish when `ready` is emitted
              // as we can do single publish then
              packagesToPublish.add(packageToPublish)
            })
          }
        }

        // don't ever copy package.json as this will mess up any future dependency
        // changes checks
        return
      }

      if (packagesToPublish.has(packageName)) {
        // we are in middle of publishing to localy registry,
        // so we don't need to copy files as yarn will handle this
        return
      }

      let localCopies = [copyPath(filePath, newPath, quiet)]

      // If this is from "cache-dir" also copy it into the site's .cache
      if (_.includes(filePath, `cache-dir`)) {
        const newCachePath = path.join(
          `.cache/`,
          path.relative(path.join(prefix, `cache-dir`), filePath)
        )
        localCopies.push(copyPath(filePath, newCachePath, quiet))
      }

      allCopies = allCopies.concat(localCopies)
    })
    .on(`ready`, async () => {
      // wait for all async work needed to be done
      // before publishing / installing
      await Promise.all(Array.from(waitFor))

      if (isInitialScan) {
        isInitialScan = false
        if (packagesToPublish.size > 0) {
          const publishAndInstallPromise = publishPackagesLocallyAndInstall({
            packagesToPublish: Array.from(packagesToPublish),
            root,
            packages,
            ignorePackageJSONChanges,
          })
          packagesToPublish.clear()
          allCopies.push(publishAndInstallPromise)
        } else if (anyPackageNotInstalled) {
          // run `yarn`
          const yarnInstallCmd = [`yarn`]

          console.log(`Installing packages from public NPM registry`)
          await promisifiedSpawn(yarnInstallCmd)
          console.log(`Installation complete`)
        }

        runQueuedCopies()
      }

      // all files watched, quit once all files are copied if necessary
      Promise.all(allCopies).then(() => {
        if (scanOnce) {
          quit()
        }
      })
    })
}

module.exports = watch
