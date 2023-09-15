import { signExtend } from '../../bitutils/onesComplement'
import { isSixteenBit, type Memory, type MemoryRef } from '../memory/memory'

export function ad (memory: Memory, operandAddress: MemoryRef): void {
  const left = memory.registers.A
  let right = memory.read(operandAddress, false)
  if (!isSixteenBit(operandAddress)) {
    right = signExtend(right)
  }
  const interim = left + right
  memory.registers.A = (interim + (interim >>> 16)) & 0o177777
}

export function com (memory: Memory): void {
  memory.registers.A = (0o177777) & (~memory.registers.A)
}

export function incr (memory: Memory, operandAddress: MemoryRef): void {
  // TODO assert erasable
  memory.registers.A = (memory.registers.A & 0o100000) | ((memory.registers.A & 0o77777) + 1)
}
