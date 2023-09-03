import { Environment } from '../../environment'
import { Memory, DirectRef } from './memory'

const environment = Environment.COMMAND_MODULE
const memory = new Memory(environment)

test('Resolve unswitched erasable address 0', () => {
  expect(memory.deduceAddress(0)).toEqual({
    kind: 'direct',
    address: 0
  })
})

test('Resolve unswitched erasable address 0o100', () => {
  expect(memory.deduceAddress(0o100)).toEqual({
    kind: 'direct',
    address: 0o100
  })
})

test('Resolve unswitched erasable address 0o477', () => {
  expect(memory.deduceAddress(0o477)).toEqual({
    kind: 'direct',
    address: 0o477
  })
})

test('Resolve unswitched erasable address 0o1377', () => {
  expect(memory.deduceAddress(0o1377)).toEqual({
    kind: 'direct',
    address: 0o1377
  })
})

test('Resolve switched erasable address bank 0 offset 0o100', () => {
  memory.registers.EBANK = 0
  expect(memory.deduceAddress(0o1500)).toEqual({
    kind: 'banked',
    bankId: 0,
    memoryType: 'erasable',
    offset: 0o100
  })
})

test('Resolve switched erasable address bank 0 offset 0o377', () => {
  memory.registers.EBANK = 0
  expect(memory.deduceAddress(0o1777)).toEqual({
    kind: 'banked',
    bankId: 0,
    memoryType: 'erasable',
    offset: 0o377
  })
})

test('Resolve switched erasable bank 1 offset 0o57', () => {
  memory.registers.EBANK = 0o400
  expect(memory.deduceAddress(0o1457)).toEqual({
    kind: 'banked',
    bankId: 1,
    memoryType: 'erasable',
    offset: 0o57
  })
})

test('Resolve switched erasable bank 5 offset 0o254', () => {
  memory.registers.EBANK = 0o2400
  expect(memory.deduceAddress(0o1654)).toEqual({
    kind: 'banked',
    bankId: 5,
    memoryType: 'erasable',
    offset: 0o254
  })
})

test('Resolve switched erasable bank 7 offset 0o377', () => {
  memory.registers.EBANK = 0o3400
  expect(memory.deduceAddress(0o1777)).toEqual({
    kind: 'banked',
    bankId: 7,
    memoryType: 'erasable',
    offset: 0o377
  })
})
