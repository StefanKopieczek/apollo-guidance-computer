import { InvalidBankError, MemoryBank } from './memoryBank'

let memArray = new MemoryBank(0, 0)

beforeEach(() => {
  memArray = new MemoryBank(3, 100)
})

test('Test get and set in bank 0', () => {
  let bank = memArray.getBank(0)
  bank[0] = 0o12345
  bank[99] = 0o54321

  // Reload the bank to make sure that writes persist.
  bank = memArray.getBank(0)
  expect(bank[0]).toEqual(0o12345)
  expect(bank[99]).toEqual(0o54321)
})

test('Bank size is set correctly', () => {
  const array1 = new MemoryBank(2, 50)
  expect(array1.getBank(0).length === 50)
  expect(array1.getBank(1).length === 50)

  const array2 = new MemoryBank(1, 150)
  expect(array2.getBank(0).length === 150)
})

test('Test can retrieve maximum bank', () => {
  const array = new MemoryBank(50, 10)
  expect(() => { array.getBank(49) }).not.toThrow()
})

test('Cannot retrieve a bank with a negative index', () => {
  expect(() => { memArray.getBank(-1) }).toThrow(InvalidBankError)
})

test('Cannot retrieve an out-of-bounds bank', () => {
  expect(() => { memArray.getBank(3) }).toThrow(InvalidBankError)
})

test('Banks are distinct', () => {
  const bank0 = memArray.getBank(0)
  bank0[0] = 0o12345

  const bank1 = memArray.getBank(1)
  expect(bank1[0]).not.toEqual(bank0[0])
})
