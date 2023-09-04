import math = require('./math')

test('CYR 0o2 === 0o1', () => {
  expect(math.cycleRight(0o2)).toEqual(0o1)
})

test('CYR 0o6 === 0o3', () => {
  expect(math.cycleRight(0o6)).toEqual(0o3)
})

test('CYR 0o1 === 0o40000', () => {
  expect(math.cycleRight(0o1)).toEqual(0o40000)
})

test('CYR 0o12345 === 0o45162', () => {
  expect(math.cycleRight(0o12345)).toEqual(0o45162)
})

test('CYL 0O1 === 0O2', () => {
  expect(math.cycleLeft(0o1)).toEqual(0o2)
})

test('CYL 0O3 === 0O6', () => {
  expect(math.cycleLeft(0o3)).toEqual(0o6)
})

test('CYL 0o47 === 0o116', () => {
  expect(math.cycleLeft(0o47)).toEqual(0o116)
})

test('CYL 0o40000 === 0o1', () => {
  expect(math.cycleLeft(0o40000)).toEqual(0o1)
})

test('CYL 0o12345 === 0o24712', () => {
  expect(math.cycleLeft(0o12345)).toEqual(0o24712)
})

test('EDOP 0o175 === 0', () => {
  expect(math.edop(0o175)).toEqual(0)
})

test('EDOP 0 === 0', () => {
  expect(math.edop(0)).toEqual(0)
})

test('EDOP 12345 === 0o51', () => {
  expect(math.edop(0o12345)).toEqual(0o51)
})

test('SHR 0O12345 === 0O5162', () => {
  expect(math.shiftRight(0o12345)).toEqual(0o5162)
})
