const { buildObjectType } = require(`../../types/type-builders`)
const { store } = require(`../../../redux`)
const { build } = require(`../..`)
require(`../../../db/__tests__/fixtures/ensure-loki`)()

const nodes = [
  {
    id: `id1`,
    internal: { type: `Test` },
    foo: true,
    inferDate: new Date(),
    explicitDate: new Date(),
    conflictType: 1,
    conflictArray: [1],
    conflictArrayType: [1],
    conflictArrayReverse: 1,
    conflictScalar: { foo: true },
    conflictScalarReverse: 1,
    conflictScalarArray: [{ foo: true }],
    conflcitScalarArrayReverse: [1],
    nested: {
      foo: true,
      conflict: 1,
      nested: {
        foo: true,
        conflict: 1,
        extraExtra: true,
      },
    },
    nestedArray: [
      {
        foo: true,
        conflict: 1,
        extra: true,
        nested: { foo: true, conflict: 1, extraExtraExtra: true },
      },
    ],
  },
  {
    id: `id2`,
    internal: { type: `ArrayTest` },
    array: [{ foo: true }],
  },
  {
    id: `id3`,
    internal: { type: `LinkTest` },
    link___NODE: `id1`,
    links___NODE: [`id1`],
  },
]

describe(`merges explicit and inferred type definitions`, () => {
  beforeEach(() => {
    store.dispatch({ type: `DELETE_CACHE` })
    nodes.forEach(node =>
      store.dispatch({ type: `CREATE_NODE`, payload: { ...node } })
    )
  })

  const buildTestSchemaWithSdl = async ({
    infer = true,
    addDefaultResolvers = true,
  }) => {
    const inferDirective = infer ? `@infer` : `@dontInfer`
    const noDefaultResolvers = addDefaultResolvers ? `false` : `true`
    const typeDefs = [
      `
      type NestedNested {
        bar: Boolean!
        conflict: String!
        notExtra: Boolean
      }

      type Nested {
        bar: Boolean!
        conflict: String!
        nested: NestedNested
      }

      type Test implements Node ${inferDirective}(noDefaultResolvers: ${noDefaultResolvers}) {
        explicitDate: Date
        bar: Boolean!
        nested: Nested!
        nestedArray: [Nested!]!
        conflictType: String!
        conflictArray: Int!
        conflictArrayReverse: [Int!]!
        conflictArrayType: [String!]!
        conflictScalar: Int!
        conflictScalarReverse: Nested!
        conflictScalarArray: [Int!]!
        conflcitScalarArrayReverse: [Nested!]!
      }`,
    ]

    typeDefs.forEach(def =>
      store.dispatch({ type: `CREATE_TYPES`, payload: def })
    )

    await build({})
    return store.getState().schema
  }

  const buildTestSchemaWithTypeBuilders = async ({
    infer = true,
    addDefaultResolvers = true,
  }) => {
    const typeDefs = [
      buildObjectType({
        name: `NestedNested`,
        fields: {
          bar: `Boolean!`,
          conflict: `String!`,
          notExtra: `Boolean`,
        },
      }),
      buildObjectType({
        name: `Nested`,
        fields: {
          bar: `Boolean!`,
          conflict: `String!`,
          nested: `NestedNested`,
        },
      }),
      buildObjectType({
        name: `Test`,
        interfaces: [`Node`],
        extensions: {
          infer,
          addDefaultResolvers,
        },
        fields: {
          explicitDate: `Date`,
          bar: `Boolean!`,
          nested: `Nested!`,
          nestedArray: `[Nested!]!`,
          conflictType: `String!`,
          conflictArray: `Int!`,
          conflictArrayReverse: `[Int!]!`,
          conflictArrayType: `[String!]!`,
          conflictScalar: `Int!`,
          conflictScalarReverse: `Nested!`,
          conflictScalarArray: `[Int!]!`,
          conflcitScalarArrayReverse: `[Nested!]!`,
        },
      }),
    ]

    typeDefs.forEach(def =>
      store.dispatch({ type: `CREATE_TYPES`, payload: def })
    )

    await build({})
    return store.getState().schema
  }

  ;[
    [`sdl`, buildTestSchemaWithSdl],
    [`typeBuilders`, buildTestSchemaWithTypeBuilders],
  ].forEach(([name, buildTestSchema]) => {
    describe(`with ${name}`, () => {
      it(`with default strategy`, async () => {
        const schema = await buildTestSchema({})
        const fields = schema.getType(`Test`).getFields()
        const nestedFields = schema.getType(`Nested`).getFields()
        const nestedNestedFields = schema.getType(`NestedNested`).getFields()

        // Non-conflicting top-level fields added
        expect(fields.foo.type.toString()).toBe(`Boolean`)
        expect(fields.bar.type.toString()).toBe(`Boolean!`)

        // Non-conflicting fields added on nested type
        expect(fields.nested.type.toString()).toBe(`Nested!`)
        expect(fields.nestedArray.type.toString()).toBe(`[Nested!]!`)
        expect(nestedFields.foo.type.toString()).toBe(`Boolean`)
        expect(nestedFields.bar.type.toString()).toBe(`Boolean!`)
        expect(nestedNestedFields.foo.type.toString()).toBe(`Boolean`)
        expect(nestedNestedFields.bar.type.toString()).toBe(`Boolean!`)

        // When type is referenced more than once on typeDefs, all non-conflicting
        // fields are added
        expect(nestedFields.extra.type.toString()).toBe(`Boolean`)
        expect(nestedNestedFields.notExtra.type.toString()).toBe(`Boolean`)
        expect(nestedNestedFields.extraExtra.type.toString()).toBe(`Boolean`)
        expect(nestedNestedFields.extraExtraExtra.type.toString()).toBe(
          `Boolean`
        )

        // Explicit typeDefs have proprity in case of type conflict
        expect(fields.conflictType.type.toString()).toBe(`String!`)
        expect(fields.conflictArray.type.toString()).toBe(`Int!`)
        expect(fields.conflictArrayReverse.type.toString()).toBe(`[Int!]!`)
        expect(fields.conflictArrayType.type.toString()).toBe(`[String!]!`)
        expect(fields.conflictScalar.type.toString()).toBe(`Int!`)
        expect(fields.conflictScalarReverse.type.toString()).toBe(`Nested!`)
        expect(fields.conflictScalarArray.type.toString()).toBe(`[Int!]!`)
        expect(fields.conflcitScalarArrayReverse.type.toString()).toBe(
          `[Nested!]!`
        )

        // Explicit typeDefs have priority on nested types as well
        expect(nestedFields.conflict.type.toString()).toBe(`String!`)
        expect(nestedNestedFields.conflict.type.toString()).toBe(`String!`)

        // Date resolvers
        expect(fields.explicitDate.resolve).toBeDefined()
        expect(fields.inferDate.resolve).toBeDefined()
      })

      it(`with @dontInfer directive`, async () => {
        const schema = await buildTestSchema({
          infer: false,
        })
        const fields = schema.getType(`Test`).getFields()
        const nestedFields = schema.getType(`Nested`).getFields()
        const nestedNestedFields = schema.getType(`NestedNested`).getFields()

        // Non-conflicting top-level fields added
        expect(fields.bar.type.toString()).toBe(`Boolean!`)

        // Not adding inferred fields
        expect(fields.foo).toBeUndefined()
        expect(nestedFields.foo).toBeUndefined()
        expect(nestedNestedFields.foo).toBeUndefined()
        expect(nestedFields.extra).toBeUndefined()
        expect(nestedNestedFields.extraExtra).toBeUndefined()
        expect(nestedNestedFields.extraExtraExtra).toBeUndefined()
        expect(fields.inferDate).toBeUndefined()

        // Non-conflicting fields added on nested type
        expect(fields.nested.type.toString()).toBe(`Nested!`)
        expect(fields.nestedArray.type.toString()).toBe(`[Nested!]!`)
        expect(nestedFields.bar.type.toString()).toBe(`Boolean!`)
        expect(nestedNestedFields.bar.type.toString()).toBe(`Boolean!`)

        // When type is referenced more than once on typeDefs, all non-conflicting
        // fields are added
        expect(nestedNestedFields.notExtra.type.toString()).toBe(`Boolean`)

        // Explicit typeDefs have proprity in case of type conflict
        expect(fields.conflictType.type.toString()).toBe(`String!`)
        expect(fields.conflictArray.type.toString()).toBe(`Int!`)
        expect(fields.conflictArrayReverse.type.toString()).toBe(`[Int!]!`)
        expect(fields.conflictArrayType.type.toString()).toBe(`[String!]!`)
        expect(fields.conflictScalar.type.toString()).toBe(`Int!`)
        expect(fields.conflictScalarReverse.type.toString()).toBe(`Nested!`)
        expect(fields.conflictScalarArray.type.toString()).toBe(`[Int!]!`)
        expect(fields.conflcitScalarArrayReverse.type.toString()).toBe(
          `[Nested!]!`
        )

        // Explicit typeDefs have priority on nested types as well
        expect(nestedFields.conflict.type.toString()).toBe(`String!`)
        expect(nestedNestedFields.conflict.type.toString()).toBe(`String!`)

        // Date resolvers
        expect(fields.explicitDate.resolve).toBeDefined()
      })

      it(`with noDefaultResolvers: true`, async () => {
        const schema = await buildTestSchema({
          addDefaultResolvers: false,
        })
        const fields = schema.getType(`Test`).getFields()
        const nestedFields = schema.getType(`Nested`).getFields()
        const nestedNestedFields = schema.getType(`NestedNested`).getFields()

        // Non-conflicting top-level fields added
        expect(fields.foo.type.toString()).toBe(`Boolean`)
        expect(fields.bar.type.toString()).toBe(`Boolean!`)

        // Non-conflicting fields added on nested type
        expect(fields.nested.type.toString()).toBe(`Nested!`)
        expect(fields.nestedArray.type.toString()).toBe(`[Nested!]!`)
        expect(nestedFields.foo.type.toString()).toBe(`Boolean`)
        expect(nestedFields.bar.type.toString()).toBe(`Boolean!`)
        expect(nestedNestedFields.foo.type.toString()).toBe(`Boolean`)
        expect(nestedNestedFields.bar.type.toString()).toBe(`Boolean!`)

        // When type is referenced more than once on typeDefs, all non-conflicting
        // fields are added
        expect(nestedFields.extra.type.toString()).toBe(`Boolean`)
        expect(nestedNestedFields.notExtra.type.toString()).toBe(`Boolean`)
        expect(nestedNestedFields.extraExtra.type.toString()).toBe(`Boolean`)
        expect(nestedNestedFields.extraExtraExtra.type.toString()).toBe(
          `Boolean`
        )

        // Explicit typeDefs have proprity in case of type conflict
        expect(fields.conflictType.type.toString()).toBe(`String!`)
        expect(fields.conflictArray.type.toString()).toBe(`Int!`)
        expect(fields.conflictArrayReverse.type.toString()).toBe(`[Int!]!`)
        expect(fields.conflictArrayType.type.toString()).toBe(`[String!]!`)
        expect(fields.conflictScalar.type.toString()).toBe(`Int!`)
        expect(fields.conflictScalarReverse.type.toString()).toBe(`Nested!`)
        expect(fields.conflictScalarArray.type.toString()).toBe(`[Int!]!`)
        expect(fields.conflcitScalarArrayReverse.type.toString()).toBe(
          `[Nested!]!`
        )

        // Explicit typeDefs have priority on nested types as well
        expect(nestedFields.conflict.type.toString()).toBe(`String!`)
        expect(nestedNestedFields.conflict.type.toString()).toBe(`String!`)

        // Date resolvers
        expect(fields.explicitDate.resolve).toBeUndefined()
        expect(fields.inferDate.resolve).toBeDefined()
      })

      it(`with both @dontInfer and noDefaultResolvers: true`, async () => {
        const schema = await buildTestSchema({
          addDefaultResolvers: false,
          infer: false,
        })

        const fields = schema.getType(`Test`).getFields()
        const nestedFields = schema.getType(`Nested`).getFields()
        const nestedNestedFields = schema.getType(`NestedNested`).getFields()

        // Non-conflicting top-level fields added
        expect(fields.bar.type.toString()).toBe(`Boolean!`)

        // Not adding inferred fields
        expect(fields.foo).toBeUndefined()
        expect(nestedFields.foo).toBeUndefined()
        expect(nestedNestedFields.foo).toBeUndefined()
        expect(nestedFields.extra).toBeUndefined()
        expect(nestedNestedFields.extraExtra).toBeUndefined()
        expect(nestedNestedFields.extraExtraExtra).toBeUndefined()
        expect(fields.inferDate).toBeUndefined()

        // Non-conflicting fields added on nested type
        expect(fields.nested.type.toString()).toBe(`Nested!`)
        expect(fields.nestedArray.type.toString()).toBe(`[Nested!]!`)
        expect(nestedFields.bar.type.toString()).toBe(`Boolean!`)
        expect(nestedNestedFields.bar.type.toString()).toBe(`Boolean!`)

        // When type is referenced more than once on typeDefs, all non-conflicting
        // fields are added
        expect(nestedNestedFields.notExtra.type.toString()).toBe(`Boolean`)

        // Explicit typeDefs have proprity in case of type conflict
        expect(fields.conflictType.type.toString()).toBe(`String!`)
        expect(fields.conflictArray.type.toString()).toBe(`Int!`)
        expect(fields.conflictArrayReverse.type.toString()).toBe(`[Int!]!`)
        expect(fields.conflictArrayType.type.toString()).toBe(`[String!]!`)
        expect(fields.conflictScalar.type.toString()).toBe(`Int!`)
        expect(fields.conflictScalarReverse.type.toString()).toBe(`Nested!`)
        expect(fields.conflictScalarArray.type.toString()).toBe(`[Int!]!`)
        expect(fields.conflcitScalarArrayReverse.type.toString()).toBe(
          `[Nested!]!`
        )

        // Explicit typeDefs have priority on nested types as well
        expect(nestedFields.conflict.type.toString()).toBe(`String!`)
        expect(nestedNestedFields.conflict.type.toString()).toBe(`String!`)

        // Date resolvers
        expect(fields.explicitDate.resolve).toBeUndefined()
      })
    })
  })

  it(`honors array depth when merging types`, async () => {
    const typeDefs = `
      type FooBar {
        bar: Boolean
      }
      type ArrayTest implements Node {
        array: [FooBar]
      }
    `
    store.dispatch({ type: `CREATE_TYPES`, payload: typeDefs })
    await build({})
    const { schema } = store.getState()
    const { foo, bar } = schema.getType(`FooBar`).getFields()
    expect(foo.type.toString()).toBe(`Boolean`)
    expect(bar.type.toString()).toBe(`Boolean`)
  })

  it(`does not merge types when array depth does not match`, async () => {
    const typeDefs = `
      type FooBar {
        bar: Boolean
      }
      type ArrayTest implements Node {
        array: FooBar
      }
    `
    store.dispatch({ type: `CREATE_TYPES`, payload: typeDefs })
    await build({})
    const { schema } = store.getState()
    const { foo, bar } = schema.getType(`FooBar`).getFields()
    expect(foo).toBeUndefined()
    expect(bar.type.toString()).toBe(`Boolean`)
  })

  it(`preserves foreign-key resolvers on ___NODE fields when noDefaultResolvers: false`, async () => {
    const typeDefs = `
      type LinkTest implements Node {
        link: Test!
        links: [Test!]!
      }
    `
    store.dispatch({ type: `CREATE_TYPES`, payload: typeDefs })

    await build({})
    const { schema } = store.getState()
    const { link, links } = schema.getType(`LinkTest`).getFields()
    expect(link.type.toString()).toBe(`Test!`)
    expect(links.type.toString()).toBe(`[Test!]!`)
    expect(link.resolve).toBeDefined()
    expect(links.resolve).toBeDefined()
  })

  it(`ignores foreign-key resolvers on ___NODE fields when noDefaultResolvers: true`, async () => {
    const typeDefs = `
      type LinkTest implements Node @infer(noDefaultResolvers: true) {
        link: Test!
        links: [Test!]!
      }
    `
    store.dispatch({ type: `CREATE_TYPES`, payload: typeDefs })

    await build({})
    const { schema } = store.getState()
    const { link, links } = schema.getType(`LinkTest`).getFields()
    expect(link.type.toString()).toBe(`Test!`)
    expect(links.type.toString()).toBe(`[Test!]!`)
    expect(link.resolve).toBeUndefined()
    expect(links.resolve).toBeUndefined()
  })
})
