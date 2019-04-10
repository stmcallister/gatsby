const { store } = require(`../../../redux`)
const { build } = require(`../..`)
const { isDate, looksLikeADate } = require(`../date`)
require(`../../../db/__tests__/fixtures/ensure-loki`)()

// Timestamps grabbed from https://github.com/moment/moment/blob/2e2a5b35439665d4b0200143d808a7c26d6cd30f/src/test/moment/is_valid.js

describe(`isDate`, () => {
  it.each([
    `1970`,
    `2019`,
    `1970-01`,
    `2019-01`,
    `1970-01-01`,
    `2010-01-01`,
    `2010-01-30`,
    `19700101`,
    `20100101`,
    `20100130`,
    `2010-01-30T23+00:00`,
    `2010-01-30T23:59+00:00`,
    `2010-01-30T23:59:59+00:00`,
    `2010-01-30T23:59:59.999+00:00`,
    `2010-01-30T23:59:59.999-07:00`,
    `2010-01-30T00:00:00.000+07:00`,
    `2010-01-30T23:59:59.999-07`,
    `2010-01-30T00:00:00.000+07`,
    `2010-01-30T23Z`,
    `2010-01-30T23:59Z`,
    `2010-01-30T23:59:59Z`,
    `2010-01-30T23:59:59.999Z`,
    `2010-01-30T00:00:00.000Z`,
    `1970-01-01T00:00:00.000001Z`,
    `2012-04-01T00:00:00-05:00`,
    `2012-11-12T00:00:00+01:00`,
  ])(`should return true for valid ISO 8601: %s`, dateString => {
    expect(isDate(dateString)).toBeTruthy()
  })

  it.each([
    `2010-01-30 23+00:00`,
    `2010-01-30 23:59+00:00`,
    `2010-01-30 23:59:59+00:00`,
    `2010-01-30 23:59:59.999+00:00`,
    `2010-01-30 23:59:59.999-07:00`,
    `2010-01-30 00:00:00.000+07:00`,
    `2010-01-30 23:59:59.999-07`,
    `2010-01-30 00:00:00.000+07`,
    `1970-01-01 00:00:00.000Z`,
    `2012-04-01 00:00:00-05:00`,
    `2012-11-12 00:00:00+01:00`,
    `1970-01-01 00:00:00.0000001 Z`,
    `1970-01-01 00:00:00.000 Z`,
    `1970-01-01 00:00:00 Z`,
    `1970-01-01 000000 Z`,
    `1970-01-01 00:00 Z`,
    `1970-01-01 00 Z`,
  ])(`should return true for ISO 8601 (no T, extra space): %s`, dateString => {
    expect(isDate(dateString)).toBeTruthy()
  })

  it.each([`1970-W31`, `2006-W01`, `1970W31`, `2009-W53-7`, `2009W537`])(
    `should return true for ISO 8601 week dates: %s`,
    dateString => {
      expect(isDate(dateString)).toBeTruthy()
    }
  )

  it.each([`1970-334`, `1970334`, `2090-001`, `2090001`])(
    `should return true for ISO 8601 ordinal dates: %s`,
    dateString => {
      expect(isDate(dateString)).toBeTruthy()
    }
  )

  it.each([`2018-08-31T23:25:16.019345+02:00`, `2018-08-31T23:25:16.019345Z`])(
    `should return true for microsecond precision: %s`,
    dateString => {
      expect(isDate(dateString)).toBeTruthy()
    }
  )

  it.skip.each([
    `2018-08-31T23:25:16.019345123+02:00`,
    `2018-08-31T23:25:16.019345123Z`,
  ])(`should return true for nanosecond precision: %s`, dateString => {
    expect(isDate(dateString)).toBeTruthy()
  })

  it.skip.each([`2018-08-31T23:25:16.012345678901+02:00`])(
    `should return false for precision beyond 9 digits: %s`,
    dateString => {
      expect(isDate(dateString)).toBeFalsy()
    }
  )

  it.each([
    `2010-00-00`,
    `2010-01-00`,
    `2010-01-40`,
    `2010-01-01T24:01`, // 24:00:00 is actually valid
    `2010-01-01T23:60`,
    `2010-01-01T23:59:60`,
    `2010-01-40T23:59:59.9999`,
    `2010-00-00T+00:00`,
    `2010-01-00T+00:00`,
    `2010-01-40T+00:00`,
    `2010-01-40T24:01+00:00`,
    `2010-01-40T23:60+00:00`,
    `2010-01-40T23:59:60+00:00`,
    `2010-01-40T23:59:59.9999+00:00`,
    `2010-01-40T23:59:59,9999+00:00`,
    `2012-04-01T00:00:00-5:00`, // should be -05:00
    `2012-04-01T00:00:00+1:00`, // should be +01:00
    undefined,
    `undefined`,
    null,
    `null`,
    [],
    {},
    ``,
    ` `,
    `2012-04-01T00:basketball`,
  ])(`should return false for invalid ISO 8601: %s`, dateString => {
    expect(isDate(dateString)).toBeFalsy()
  })

  it.skip.each([
    1371065286,
    1379066897.0,
    1379066897.7,
    1379066897.0,
    1379066897.07,
    1379066897.17,
    1379066897.0,
    1379066897.007,
    1379066897.017,
    1379066897.157,
    `1371065286`,
    `1379066897.`,
    `1379066897.0`,
    `1379066897.7`,
    `1379066897.00`,
    `1379066897.07`,
    `1379066897.17`,
    `1379066897.000`,
    `1379066897.007`,
    `1379066897.017`,
    `1379066897.157`,
  ])(`should return true for unix timestamps: %s`, dateString => {
    expect(isDate(dateString)).toBeTruthy()
  })
})

describe(`looksLikeADate`, () => {
  it.each([
    `1970`,
    `2019`,
    `1970-01`,
    `2019-01`,
    `1970-01-01`,
    `2010-01-01`,
    `2010-01-30`,
    `19700101`,
    `20100101`,
    `20100130`,
    `2010-01-30T23+00:00`,
    `2010-01-30T23:59+00:00`,
    `2010-01-30T23:59:59+00:00`,
    `2010-01-30T23:59:59.999+00:00`,
    `2010-01-30T23:59:59.999-07:00`,
    `2010-01-30T00:00:00.000+07:00`,
    `2010-01-30T23:59:59.999-07`,
    `2010-01-30T00:00:00.000+07`,
    `2010-01-30T23Z`,
    `2010-01-30T23:59Z`,
    `2010-01-30T23:59:59Z`,
    `2010-01-30T23:59:59.999Z`,
    `2010-01-30T00:00:00.000Z`,
    `1970-01-01T00:00:00.000001Z`,
    `2012-04-01T00:00:00-05:00`,
    `2012-11-12T00:00:00+01:00`,
  ])(`should return true for valid ISO 8601: %s`, dateString => {
    expect(looksLikeADate(dateString)).toBeTruthy()
  })

  it.each([
    `2010-01-30 23+00:00`,
    `2010-01-30 23:59+00:00`,
    `2010-01-30 23:59:59+00:00`,
    `2010-01-30 23:59:59.999+00:00`,
    `2010-01-30 23:59:59.999-07:00`,
    `2010-01-30 00:00:00.000+07:00`,
    `2010-01-30 23:59:59.999-07`,
    `2010-01-30 00:00:00.000+07`,
    `1970-01-01 00:00:00.000Z`,
    `2012-04-01 00:00:00-05:00`,
    `2012-11-12 00:00:00+01:00`,
    `1970-01-01 00:00:00.0000001 Z`,
    `1970-01-01 00:00:00.000 Z`,
    `1970-01-01 00:00:00 Z`,
    `1970-01-01 000000 Z`,
    `1970-01-01 00:00 Z`,
    `1970-01-01 00 Z`,
  ])(`should return true for ISO 8601 (no T, extra space): %s`, dateString => {
    expect(looksLikeADate(dateString)).toBeTruthy()
  })

  it.each([`1970-W31`, `2006-W01`, `1970W31`, `2009-W53-7`, `2009W537`])(
    `should return true for ISO 8601 week dates: %s`,
    dateString => {
      expect(looksLikeADate(dateString)).toBeTruthy()
    }
  )

  it.each([`1970-334`, `1970334`, `2090-001`, `2090001`])(
    `should return true for ISO 8601 ordinal dates: %s`,
    dateString => {
      expect(looksLikeADate(dateString)).toBeTruthy()
    }
  )

  it.skip.each([
    `2018-08-31T23:25:16.019345+02:00`,
    `2018-08-31T23:25:16.019345Z`,
  ])(`should return true for microsecond precision: %s`, dateString => {
    expect(looksLikeADate(dateString)).toBeTruthy()
  })

  it.skip.each([
    `2018-08-31T23:25:16.019345123+02:00`,
    `2018-08-31T23:25:16.019345123Z`,
  ])(`should return true for nanosecond precision: %s`, dateString => {
    expect(looksLikeADate(dateString)).toBeTruthy()
  })

  it.skip.each([`2018-08-31T23:25:16.012345678901+02:00`])(
    `should return false for precision beyond 9 digits: %s`,
    dateString => {
      expect(looksLikeADate(dateString)).toBeFalsy()
    }
  )

  it.each([
    `2010-00-00`,
    `2010-01-00`,
    `2010-01-40`,
    `2010-01-01T24:01`, // 24:00:00 is actually valid
    `2010-01-40T24:01+00:00`,
    `2010-01-01T23:60`,
    `2010-01-01T23:59:60`,
    `2010-01-40T23:60+00:00`,
    `2010-01-40T23:59:60+00:00`,
  ])(`should return true for some valid ISO 8601: %s`, dateString => {
    expect(looksLikeADate(dateString)).toBeTruthy()
  })

  it.each([
    `2010-01-40T23:59:59.9999`,
    `2010-01-40T23:59:59.9999+00:00`,
    `2010-01-40T23:59:59,9999+00:00`,
    `2010-00-00T+00:00`,
    `2010-01-00T+00:00`,
    `2010-01-40T+00:00`,
    `2012-04-01T00:00:00-5:00`, // should be -05:00
    `2012-04-01T00:00:00+1:00`, // should be +01:00
    undefined,
    `undefined`,
    null,
    `null`,
    [],
    {},
    ``,
    ` `,
    `2012-04-01T00:basketball`,
  ])(`should return false for invalid ISO 8601: %s`, dateString => {
    expect(looksLikeADate(dateString)).toBeFalsy()
  })
})

const nodes = [
  {
    id: `id1`,
    internal: { type: `Test` },
    testDate: new Date(),
    explicitValidDate: `2010-01-30T23:59:59.999-07:00`,
    inferredValidDate: `1970-01-01T00:00:00.000Z`,
    validYYYY: `1970`,
    validYYMM: `2019-01`,
    validYYMMDD: `2010-01-30`,
    validYYMMDDNoDash: `20100101`,
    validISO1: `2010-01-30T23:59:59.999+00:00`,
    validISO2: `2010-01-30T23:59:59.999-07:00`,
    validISO3: `2010-01-30T00:00:00.000+07:00`,
    validISO4: `2010-01-30T23:59:59.999-07`,
    validISO5: `2010-01-30T00:00:00.000+07`,
    validISO6: `2010-01-30 00:00:00.000Z`,
    validISO7: `1970-01-01T00:00:00.000Z`,
    validISO8: `2012-04-01T00:00:00-05:00`,
    validISO9: `2012-11-12T00:00:00+01:00`,

    validOrdinal1: `1970-334`,
    validOrdinal2: `1970334`,
    validOrdinal3: `2090-001`,
    validOrdinal4: `2090001`,

    validWeek1: `1970-W31`,
    validWeek2: `2006-W01`,
    validWeek3: `1970W31`,
    validWeek4: `2009-W53-7`,
    validWeek5: `2009W537`,

    validMicrosecond1: `2018-08-31T23:25:16.019345+02:00`,
    validMicrosecond2: `2018-08-31T23:25:16.019345Z`,

    validNanosecond1: `2018-08-31T23:25:16.019345123+02:00`,
    validNanosecond2: `2018-08-31T23:25:16.019345123Z`,

    invalidHighPrecision: `2018-08-31T23:25:16.01234567899993+02:00`,

    invalidDate1: `2010-00-00`,
    invalidDate2: `2010-01-00`,
    invalidDate3: `2010-01-40`,
    invalidDate4: `2010-01-01T24:01`, // 24:00:00 is actually valid
    invalidDate5: `2010-01-01T23:60`,
    invalidDate6: `2010-01-01T23:59:60`,
    invalidDate7: `2010-01-40T23:59:59.9999`,

    invalidDate8: undefined,
    invalidDate9: `undefined`,
    invalidDate10: null,
    invalidDate11: `null`,
    invalidDate12: [],
    invalidDate13: {},
    invalidDate14: ``,
    invalidDate15: ` `,
    invalidDate16: `2012-04-01T00:basketball`,
  },
]

describe(`dateResolver`, () => {
  beforeEach(() => {
    store.dispatch({ type: `DELETE_CACHE` })
    nodes.forEach(node =>
      store.dispatch({ type: `CREATE_NODE`, payload: { ...node } })
    )
  })

  const buildTestSchema = async ({
    infer = true,
    addDefaultResolvers = true,
  }) => {
    const inferDirective = infer ? `@infer` : `@dontInfer`
    const noDefaultResolvers = addDefaultResolvers ? `false` : `true`
    const typeDefs = [
      `
      type Test implements Node ${inferDirective}(noDefaultResolvers: ${noDefaultResolvers}) {
        testDate: Date
        explicitValidDate: Date
        invalidHighPrecision: Date
        invalidDate8: Date
        invalidDate9: Date
        invalidDate10: Date
        invalidDate11: Date
        invalidDate12: Date
        invalidDate13: Date
        invalidDate14: Date
        invalidDate15: Date
        invalidDate16: Date
      }`,
    ]
    typeDefs.forEach(def =>
      store.dispatch({ type: `CREATE_TYPES`, payload: def })
    )

    await build({})
    return store.getState().schema
  }

  it(`can properly resolve datetimes`, async () => {
    const schema = await buildTestSchema({})
    const fields = schema.getType(`Test`).getFields()

    expect(fields.testDate.resolve).toBeDefined()
    expect(fields.explicitValidDate.resolve).toBeDefined()
    expect(fields.inferredValidDate.resolve).toBeDefined()
    expect(fields.validYYYY.resolve).toBeDefined()
    expect(fields.validYYMM.resolve).toBeDefined()
    expect(fields.validYYMMDD.resolve).toBeDefined()
    expect(fields.validYYMMDDNoDash.resolve).toBeDefined()

    expect(fields.validISO1.resolve).toBeDefined()
    expect(fields.validISO2.resolve).toBeDefined()
    expect(fields.validISO3.resolve).toBeDefined()
    expect(fields.validISO4.resolve).toBeDefined()
    expect(fields.validISO5.resolve).toBeDefined()
    expect(fields.validISO6.resolve).toBeDefined()
    expect(fields.validISO7.resolve).toBeDefined()
    expect(fields.validISO8.resolve).toBeDefined()
    expect(fields.validISO9.resolve).toBeDefined()

    expect(fields.validOrdinal1.resolve).toBeDefined()
    expect(fields.validOrdinal2.resolve).toBeDefined()
    expect(fields.validOrdinal3.resolve).toBeDefined()
    expect(fields.validOrdinal4.resolve).toBeDefined()

    expect(fields.validWeek1.resolve).toBeDefined()
    expect(fields.validWeek2.resolve).toBeDefined()
    expect(fields.validWeek3.resolve).toBeDefined()
    expect(fields.validWeek4.resolve).toBeDefined()
    expect(fields.validWeek5.resolve).toBeDefined()

    expect(fields.validMicrosecond1.resolve).toBeDefined()
    expect(fields.validMicrosecond2.resolve).toBeDefined()

    expect(fields.validNanosecond1.resolve).toBeDefined()
    expect(fields.validNanosecond2.resolve).toBeDefined()
    // expect(fields.invalidHighPrecision.resolve).toBeDefined()
    expect(fields.invalidDate1.resolve).toBeUndefined()
    expect(fields.invalidDate2.resolve).toBeUndefined()
    expect(fields.invalidDate3.resolve).toBeUndefined()
    expect(fields.invalidDate4.resolve).toBeUndefined()
    expect(fields.invalidDate5.resolve).toBeUndefined()
    expect(fields.invalidDate6.resolve).toBeUndefined()
    expect(fields.invalidDate7.resolve).toBeUndefined()
    expect(fields.invalidDate8.resolve).toBeUndefined()
    expect(fields.invalidDate9.resolve).toBeUndefined()
    expect(fields.invalidDate10.resolve).toBeUndefined()
    expect(fields.invalidDate11.resolve).toBeUndefined()
    expect(fields.invalidDate12.resolve).toBeUndefined()
    expect(fields.invalidDate13.resolve).toBeUndefined()
    expect(fields.invalidDate14.resolve).toBeUndefined()
    expect(fields.invalidDate15.resolve).toBeUndefined()
    expect(fields.invalidDate16.resolve).toBeUndefined()
  })

  it.each([
    `2018-01-28T23:59:59.999-07:00`,
    `2018-01-29T00:00:00.000Z`,
    `2018-01-29`,
    `20180129`,
    `2018-01-29T23:59:59.999+00:00`,
    `2018-01-28T19:59:59.999-07:00`,
    `2018-01-30T06:00:00.001+07:00`,
    `2018-01-28 17:00:00.001-07`,
    `2018-01-30 04:00:00.001+07`,
    `2018-01-29 04:00:00.001Z`,
    `2018-01-29 04:00:00.001 Z`,
    `2018-01-29 04:00:00 Z`,
    `2018-01-29 04:00 Z`,
    `2018-01-29 04 Z`,
    `2018-01-28T17:00:00.001-07`,
    `2018-01-30T04:00:00.001+07`,
    `2018-01-29 00:00:00.001Z`,
    `2018-01-29T00:00:00.001Z`,
    `2018-01-28 23:00:00-05:00`,
    `2018-01-29 23:00:00+01:00`,
    `2018-01-28T23:00:00-05:00`,
    `2018-01-29T23:00:00+01:00`,
    `2018-029`,
    `2018029`,
    `2018-W05`,
    `2018W05`,
    `2018-W05-1`,
    `2018-01-29T23:25:16.019345+02:00`,
    `2018-01-29T23:25:16.019345Z`,
    // Seems to not require nanosecond definition to not fail
    `2018-01-29T23:25:16.019345123+02:00`,
    `2018-01-29T23:25:16.019345123Z`,
  ])(`should return "Jan 29, 2018": %s`, async dateString => {
    const schema = await buildTestSchema({})
    const fields = schema.getType(`Test`).getFields()
    expect(
      fields[`testDate`].resolve(
        { date: dateString },
        { formatString: `MMM DD, YYYY` },
        {},
        {
          fieldName: `date`,
        }
      )
    ).toEqual(`Jan 29, 2018`)
  })

  it.each([
    `2010-00-00`,
    `2010-01-00`,
    `2010-01-40`,
    `2010-01-01T24:01`,
    `2010-01-01T23:60`,
    `2010-01-01T23:59:60`,
    `2010-01-40T23:59:59.9999`,
    // Combine with above statement once we figure out why it passes
    // `2018-08-31T23:25:16.01234567899993+02:00`,
  ])(`should return "Invalid Date": %s`, async dateString => {
    const schema = await buildTestSchema({})
    const fields = schema.getType(`Test`).getFields()
    expect(
      fields[`testDate`].resolve(
        { date: dateString },
        { formatString: `MMM DD, YYYY` },
        {},
        {
          fieldName: `date`,
        }
      )
    ).toEqual(`Invalid date`)
  })
})
