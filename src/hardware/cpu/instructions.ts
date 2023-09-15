import { type Memory, type MemoryRef } from '../memory/memory'

export function ad (memory: Memory, operandAddress: MemoryRef): void {
  const left = memory.registers.A & 0o77777
  const right = memory.read(operandAddress)
  const interim = left + right
  const result = (interim & 0o77777) + (interim >>> 15)
  memory.registers.A = (memory.registers.A & 0o100000) | result
}
