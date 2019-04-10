const { graphql } = require(`graphql`)
const { createSchemaComposer } = require(`../schema-composer`)
const { buildSchema } = require(`../schema`)
const { LocalNodeModel } = require(`../node-model`)
const nodeStore = require(`../../db/nodes`)
const { store } = require(`../../redux`)

jest.mock(`../../redux/actions/add-page-dependency`)
const createPageDependency = require(`../../redux/actions/add-page-dependency`)

require(`../../db/__tests__/fixtures/ensure-loki`)()

const makeNodes = () => [
  {
    id: `p1`,
    internal: { type: `Parent` },
    hair: `red`,
    children: [`c1`, `c2`, `r1`],
  },
  {
    id: `r1`,
    internal: { type: `Relative` },
    hair: `black`,
    children: [],
    parent: `p1`,
  },
  {
    id: `c1`,
    internal: { type: `Child` },
    hair: `brown`,
    children: [],
    parent: `p1`,
  },
  {
    id: `c2`,
    internal: { type: `Child` },
    hair: `blonde`,
    children: [],
    parent: `p1`,
  },
]

describe(`build-node-connections`, () => {
  async function runQuery(query, nodes = makeNodes()) {
    store.dispatch({ type: `DELETE_CACHE` })
    nodes.forEach(node =>
      store.dispatch({ type: `CREATE_NODE`, payload: node })
    )

    const schemaComposer = createSchemaComposer()
    const schema = await buildSchema({
      schemaComposer,
      nodeStore,
      types: [],
      thirdPartySchemas: [],
    })
    store.dispatch({ type: `SET_SCHEMA`, payload: schema })

    let context = { path: `foo` }
    let { data, errors } = await graphql(schema, query, undefined, {
      ...context,
      nodeModel: new LocalNodeModel({
        schema,
        nodeStore,
        createPageDependency,
      }),
    })
    expect(errors).not.toBeDefined()
    return data
  }

  afterEach(() => {
    createPageDependency.mockClear()
  })

  it(`should result in a valid queryable schema`, async () => {
    let { allParent, allChild, allRelative } = await runQuery(
      `
      {
        allParent(filter: { id: { eq: "p1" } }) {
          edges {
            node {
              hair
            }
          }
        }
        allChild(filter: { id: { eq: "c1" } }) {
          edges {
            node {
              hair
            }
          }
        }
        allRelative(filter: { id: { eq: "r1" } }) {
          edges {
            node {
              hair
            }
          }
        }
      }
    `
    )
    expect(allParent.edges[0].node.hair).toEqual(`red`)
    expect(allChild.edges[0].node.hair).toEqual(`brown`)
    expect(allRelative.edges[0].node.hair).toEqual(`black`)
  })

  it(`should link children automatically`, async () => {
    let { allParent } = await runQuery(
      `
      {
        allParent(filter: { id: { eq: "p1" } }) {
          edges {
            node {
              children {
                id
              }
            }
          }
        }
      }
    `
    )
    expect(allParent.edges[0].node.children).toBeDefined()
    expect(allParent.edges[0].node.children.map(c => c.id)).toEqual([
      `c1`,
      `c2`,
      `r1`,
    ])
  })

  it(`should create typed children fields`, async () => {
    let { allParent } = await runQuery(
      `
      {
        allParent(filter: { id: { eq: "p1" } }) {
          edges {
            node {
              childrenChild { # lol
                id
              }
            }
          }
        }
      }
    `
    )
    expect(allParent.edges[0].node.childrenChild).toBeDefined()
    expect(allParent.edges[0].node.childrenChild.map(c => c.id)).toEqual([
      `c1`,
      `c2`,
    ])
  })

  it(`should create typed child field for singular children`, async () => {
    let { allParent } = await runQuery(
      `
      {
        allParent(filter: { id: { eq: "p1" } }) {
          edges {
            node {
              childRelative { # lol
                id
              }
            }
          }
        }
      }
    `
    )

    expect(allParent.edges[0].node.childRelative).toBeDefined()
    expect(allParent.edges[0].node.childRelative.id).toEqual(`r1`)
  })

  it(`should create page dependency`, async () => {
    await runQuery(
      `
      {
        allParent(filter: { id: { eq: "p1" } }) {
          edges {
            node {
              childRelative { # lol
                id
              }
            }
          }
        }
      }
    `
    )

    expect(createPageDependency).toHaveBeenCalledWith({
      path: `foo`,
      connection: `Parent`,
    })
  })
})
