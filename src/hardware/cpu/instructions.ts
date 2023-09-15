import { signExtend } from '../../bitutils/onesComplement'
import { type Memory, type MemoryRef } from '../memory/memory'

export function ad (memory: Memory, operandAddress: MemoryRef): void {
  addToAcc(memory, memory.read(operandAddress))
}

function addToAcc (memory: Memory, value: number): void {
  const left = memory.registers.A 
  const right = signExtend(value)
  const interim = left + right
  const result = (interim + (interim >>> 16)) & 0o177777
  memory.registers.A = result
}

export function com (memory: Memory): void {
  memory.registers.A = (0o177777) & (~memory.registers.A)
}

export function incr (memory: Memory, operandAddress: MemoryRef) {
    // TODO assert erasable
    memory.registers.A = (memory.registers.A & 0o100000) | ((memory.registers.A & 0o77777) + 1)
}
