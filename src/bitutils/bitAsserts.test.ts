import bitAsserts = require('./bitAsserts')

test('0o3 has width <= 2', () => {
    expect(() => bitAsserts.assertWidth(0o3, 2)).not.toThrow()
})

test('0o3 has width <= 3', () => {
    expect(() => bitAsserts.assertWidth(0o3, 3)).not.toThrow()
})

test('0o3 does not have width <= 1', () => {
    expect(() => bitAsserts.assertWidth(0o3, 1)).toThrow(bitAsserts.ValueTooWideError)
})

test('0o76543 has width <= 15', () => {
    expect(() => bitAsserts.assertWidth(0o76543, 15)).not.toThrow()
})

test('0o176543 does not have width <= 15', () => {
    expect(() => bitAsserts.assertWidth(0o176543, 15)).toThrow(bitAsserts.ValueTooWideError)
})

test('0o77 has shape 0o77', () => {
    expect(() => bitAsserts.assertShape(0o77, 0o77)).not.toThrow()
})

test('0o00 has shape 0o77', () => {
    expect(() => bitAsserts.assertShape(0o00, 0o77)).not.toThrow()
})

test('0o34 has shape 0o77', () => {
    expect(() => bitAsserts.assertShape(0o34, 0o77)).not.toThrow()
})

test('0o77 does not have shape 0o34', () => {
    expect(() => bitAsserts.assertShape(0o77, 0o34)).toThrow(bitAsserts.InvalidShapeError)
})

test('0o77 does not have shape 0o07', () => {
    expect(() => bitAsserts.assertShape(0o77, 0o07)).toThrow(bitAsserts.InvalidShapeError)
})

test('0o41 has shape 0o63', () => {
    expect(() => bitAsserts.assertShape(0o41, 0o63)).not.toThrow()
})