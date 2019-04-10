---
title: Themes API Reference
---

> ⚠⚠ Gatsby Themes are currently experimental ⚠⚠

## Table of contents

- [Core Gatsby APIs](#core-gatsby-apis)
- [Configuration](#configuration)
- [Component shadowing](#component-shadowing)
- [Theme composition](#theme-composition)
- [Add theme transpilation](#add-theme-transpilation)

## Core Gatsby APIs

Themes are packaged Gatsby sites, so you have access to all of Gatsby's APIs for modifying default configuration settings and functionality.

- [Gatsby Config](https://www.gatsbyjs.org/docs/gatsby-config/)
- [Actions](https://www.gatsbyjs.org/docs/actions/)
- [Node Interface](https://www.gatsbyjs.org/docs/node-interface/)
- ... [and more](https://www.gatsbyjs.org/docs/api-specification/)

If you're new to Gatsby you can get started by following along with the guides for building out a site. Converting it to a theme will be straightforward later on since themes are prepackaged Gatsby sites.

## Configuration

Similarly to plugins, you can access options that are passed to your theme.
You can use this to make filesystem sourcing configurable, accept different nav menu items, or change branding colors from the default.

```js:title=gatsby-config.js
module.exports = {
  __experimentalThemes: [
    {
      resolve: "gatsby-theme-name",
      options: {
        postsPath: "/blog",
        colors: {
          primary: "tomato",
        },
      },
    },
  ],
}
```

In your theme's `gatsby-config.js` you can return a function: the argument it receives are the options:

```js:title=gatsby-config.js
module.exports = themeOptions => {
  console.log(themeOptions)

  return {
    plugins: [
      // ...
    ],
  }
}
```

Then, in your theme's `gatsby-node.js` you can access them as the second argument to `createPages`:

```js:title=gatsby-node.js
exports.createPages = async ({ graphql, actions }, themeOptions) => {
  console.log(themeOptions)
}
```

## Component Shadowing

Gatsby Themes allow you to customize any file in a theme's `src` directory by following a file naming convention.
If you're using `gatsby-theme-tomato` which uses a `ProfileCard` component located at `src/components/profile-card.js` you can override the component by creating `src/gatsby-theme-tomato/components/profile-card.js`. If you want to see what props are passed you can do so by putting the props into a `pre` tag:

```js:title=src/gatsby-theme-tomato/components/profile-card.js
import React from "react"

export default props => <pre>{JSON.stringify(props, null, 2)}</pre>
```

## Theme composition

A theme can declare another theme as a parent theme. This means that a theme can declare another theme in its
own `gatsby-config.js`. So if you'd like to use `gatsby-theme-blog` to build off of you can and install the theme
and then configure it:

```js:title=gatsby-config.js
module.exports = {
  __experimentalThemes: ["gatsby-theme-blog"],
}
```

## Add theme transpilation

**Note**: This is only needed temporarily. Themes will automatically be transpiled in later versions.

Since your theme will be installed, it will end up in `node_modules` which Gatsby doesn't transpile by default.
This is something you can achieve with `gatsby-plugin-compile-es6-packages`.

You will need to install the package:

```sh
npm install --save gatsby-plugin-compile-es6-packages
```

And then add it to your plugins list:

```js:title=gatsby-config.js
const path = require("path")

module.exports = {
  plugins: [
    {
      resolve: "gatsby-plugin-page-creator",
      options: {
        path: path.join(__dirname, "src", "pages"),
      },
    },
    {
      resolve: "gatsby-plugin-compile-es6-packages",
      options: {
        // replace with the name of your theme
        // highlight-next-line
        modules: ["gatsby-theme-developer"],
      },
    },
  ],
}
```
