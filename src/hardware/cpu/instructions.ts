import { type Memory, type MemoryRef } from '../memory/memory'

export function ad (memory: Memory, operandAddress: MemoryRef): void {
  addToAcc(memory, memory.read(operandAddress))
}

function addToAcc (memory: Memory, value: number): void {
  const left = memory.registers.A & 0o77777
  const right = value
  const interim = left + right
  const result = (interim & 0o77777) + (interim >>> 15)
  memory.registers.A = (memory.registers.A & 0o100000) | result
}

export function com (memory: Memory): void {
  memory.registers.A = (0o177777) & (~memory.registers.A)
}

export function double (memory: Memory): void {
  addToAcc(memory, memory.registers.A & 0o77777)
}
