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

test('Resolve unswitched fixed storage offset 0o4000', () => {
  expect(memory.deduceAddress(0o4000)).toEqual({
    kind: 'direct',
    address: 0o4000
  })
})

test('Resolve unswitched fixed storage offset 0o5123', () => {
  expect(memory.deduceAddress(0o5123)).toEqual({
    kind: 'direct',
    address: 0o5123
  })
})

test('Resolve unswitched fixed storage offset 0o5777', () => {
  expect(memory.deduceAddress(0o5777)).toEqual({
    kind: 'direct',
    address: 0o5777
  })
})

test('Resolve unswitched fixed storage offset 0o6000', () => {
  expect(memory.deduceAddress(0o6000)).toEqual({
    kind: 'direct',
    address: 0o6000
  })
})

test('Resolve unswitched fixed storage offset 0o6765', () => {
  expect(memory.deduceAddress(0o6765)).toEqual({
    kind: 'direct',
    address: 0o6765
  })
})

test('Resolve unswitched fixed storage offset 0o7777', () => {
  expect(memory.deduceAddress(0o7777)).toEqual({
    kind: 'direct',
    address: 0o7777
  })
})

test('Resolve switched fixed storage bank 0 offset 0o30', () => {
  memory.isSuperbankSet = false
  memory.registers.FBANK = 0
  expect(memory.deduceAddress(0o2030)).toEqual({
    kind: 'banked',
    bankId: 0,
    memoryType: 'fixed',
    offset: 0o30
  })
})

test('Resolve switched fixed storage bank 1 offset 0o1634', () => {
  memory.isSuperbankSet = false
  memory.registers.FBANK = 0o2000
  expect(memory.deduceAddress(0o3634)).toEqual({
    kind: 'banked',
    bankId: 1,
    memoryType: 'fixed',
    offset: 0o1634
  })
})

test('Resolve switched fixed storage bank 31 offset 0o1777', () => {
  memory.isSuperbankSet = false
  memory.registers.FBANK = 0o76000
  expect(memory.deduceAddress(0o3777)).toEqual({
    kind: 'banked',
    bankId: 31,
    memoryType: 'fixed',
    offset: 0o1777
  })
})

test('Resolve switched fixed storage bank 32 offset 0o1234', () => {
  memory.isSuperbankSet = true
  memory.registers.FBANK = 0o60000
  expect(memory.deduceAddress(0o3234)).toEqual({
    kind: 'banked',
    bankId: 32,
    memoryType: 'fixed',
    offset: 0o1234
  })
})

test('Resolve switched fixed storage bank 33 offset 0o234', () => {
  memory.isSuperbankSet = true
  memory.registers.FBANK = 0o62000
  expect(memory.deduceAddress(0o2234)).toEqual({
    kind: 'banked',
    bankId: 33,
    memoryType: 'fixed',
    offset: 0o0234
  })
})

test('Resolve switched fixed storage bank 35 offset 0o1777', () => {
  memory.isSuperbankSet = true
  memory.registers.FBANK = 0o66000
  expect(memory.deduceAddress(0o3777)).toEqual({
    kind: 'banked',
    bankId: 35,
    memoryType: 'fixed',
    offset: 0o1777
  })
})

test('Switched fixed bank 36 is dead', () => {
  memory.isSuperbankSet = true
  memory.registers.FBANK = 0o70000
  expect(memory.deduceAddress(0o3777)).toEqual({
    kind: 'deadbank'
  })
})

test('Switched fixed bank 39 is dead', () => {
  memory.isSuperbankSet = true
  memory.registers.FBANK = 0o76000
  expect(memory.deduceAddress(0o3000)).toEqual({
    kind: 'deadbank'
  })
})
