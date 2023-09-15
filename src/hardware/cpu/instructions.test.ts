import { Environment } from '../../environment'
import { Memory, type MemoryRef } from '../memory/memory'
import { ad, com, incr } from './instructions'

let memory: Memory

// NB that this is the address of register A.
const addr0: MemoryRef = {
    kind: 'direct',
    address: 0
}

const addr0o100: MemoryRef = {
  kind: 'direct',
  address: 0o100
}

beforeEach(() => {
  memory = new Memory(Environment.COMMAND_MODULE)
})

test('Test AD [(+0) + (+1) = (+1)]', () => {
  memory.registers.A = 0
  memory.write(addr0o100, 1)
  ad(memory, addr0o100)
  expect(memory.registers.A).toEqual(1)
})

test('Test AD [(+0) + (-1) = (-1)]', () => {
  memory.registers.A = 0
  memory.write(addr0o100, 0o77776)
  ad(memory, addr0o100)
  expect(memory.registers.A).toEqual(0o77776)
})

test('Test AD [(+1) + (-1) = (-0)]', () => {
  memory.registers.A = 1
  memory.write(addr0o100, 0o77776)
  ad(memory, addr0o100)
  expect(memory.registers.A).toEqual(0o77777)
})

test('Test AD [(+0o02000) + (+0o06000) = (+0o10000)', () => {
  // Add large positive numbers, no overflow.
  memory.registers.A = 0o2000
  memory.write(addr0o100, 0o6000)
  ad(memory, addr0o100)
  expect(memory.registers.A).toEqual(0o10000)
})

test('Test AD [(+0o22000) + (+0o26000) = (+0o50000)', () => {
  // Add large positive numbers, with overflow.
  memory.registers.A = 0o22000
  memory.write(addr0o100, 0o26000)
  ad(memory, addr0o100)
  expect(memory.registers.A).toEqual(0o50000)
})

test('Test AD [(-0o3777) + (-0o7777) = (-0o13776)', () => {
  // Add large negative numbers, with end-around-carry but no overflow.
  memory.registers.A = 0o174000
  memory.write(addr0o100, 0o70000)
  ad(memory, addr0o100)
  expect(memory.registers.A).toEqual(0o164001)
})

test('Test AD [(-0o37777) + (-0o30000) = (+0o10000)', () => {
  // Add large negative numbers, with overflow.
  memory.registers.A = 0o140000
  memory.write(addr0o100, 0o47777)
  ad(memory, addr0o100)
  expect(memory.registers.A).toEqual(0o110000)
})

test('Test COM 0o123456 = 0o054321', () => {
  memory.registers.A = 0o123456
  com(memory)
  expect(memory.registers.A).toEqual(0o54321)
})

test('Test COM 0o54321 = 0o123456', () => {
  memory.registers.A = 0o54321
  com(memory)
  expect(memory.registers.A).toEqual(0o123456)
})

test('Test COM 0o000000 = 0o177777', () => {
  memory.registers.A = 0
  com(memory)
  expect(memory.registers.A).toEqual(0o177777)
})

test('Test COM 0o177777 = 0o000000', () => {
  memory.registers.A = 0o177777
  com(memory)
  expect(memory.registers.A).toEqual(0)
})

test('Test INCR A (when A is +0)', () => {
    memory.registers.A = 0
    incr(memory, addr0)
    expect(memory.registers.A).toEqual(1)
})

test('Test INCR A (when A is +1)', () => {
    memory.registers.A = 1
    incr(memory, addr0)
    expect(memory.registers.A).toEqual(2)
})

test('Test INCR A (when A is -1)', () => {
    memory.registers.A = 0o177776
    incr(memory, addr0)
    expect(memory.registers.A).toEqual(0o177777)
})

test('Test INCR A (when A is 0o37777)', () => {
    // Overflow occurs, with no correction.
    memory.registers.A = 0o37777
    incr(memory, addr0)
    expect(memory.registers.A).toEqual(0o40000)
})

test('Test INCR A (when A is -0o37777)', () => {
    memory.registers.A = 0o140000
    incr(memory, addr0)
    expect(memory.registers.A).toEqual(0o140001)
})

test('Test INCR A (when A is -0)', () => {
    memory.registers.A = 0o177777
    incr(memory, addr0)
    expect(memory.registers.A).toEqual(0o100000)
})

test('Test INCR A (when A is in an overflow state', () => {
    // No overflow correction occurs.
    memory.registers.A = 0o40000
    incr(memory, addr0)
    expect(memory.registers.A).toEqual(0o40001)
})