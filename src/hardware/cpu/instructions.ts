import { signExtend } from '../../bitutils/onesComplement'
import { isSixteenBit, type Memory, type MemoryRef } from '../memory/memory'

export function ad (memory: Memory, operandAddress: MemoryRef): void {
  // The AD instruction adds the specified memory location to the accumulator.
  // If the location is (as is usual) 15 bits wide, it will be sign extended to the 16th bit
  // in order to detect overflows during addition.
  // If instead the location is 16 bits wide (as with Q, or the accumulator itself)
  // then its sixteenth bit will be preserved unchanged when loaded, and will then
  // be used normally as part of the addition.
  const left = memory.registers.A
  let right = memory.read(operandAddress, false)
  if (!isSixteenBit(operandAddress)) {
    right = signExtend(right)
  }
  let interim = left + right

  // End-around carry: this is standard ones' complement arithmetic.
  // When adding two ones' complement numbers, if the final result has a carry,
  // that carry should be added to the LSB of the result.
  const carry = interim >>> 16
  interim += carry

  memory.registers.A = interim & 0o177777
}

export function com (memory: Memory): void {
  // The COM instruction flips all bits of the accumulator.
  // This includes bit 16.
  memory.registers.A = (0o177777) & (~memory.registers.A)
}

export function incr (memory: Memory, operandAddress: MemoryRef): void {
  // The INCR instruction adds +1 to the contents of the specified address.
  // This can overflow; if this occurs in the 16 bit registers then
  // it will create the usual mismatch between bits 15 and 16 and the overflow
  // condition will be set.
  // Overflow in the 15 bit registers will simply cause wraparound.
  const operand = memory.read(operandAddress, false)

  let mask, shift
  if (isSixteenBit(operandAddress)) {
    mask = 0o177777
    shift = 16
  } else {
    mask = 0o77777
    shift = 15
  }

  let interim = operand + 1
  interim = interim + (interim >>> shift) // End-around carry; see AD
  memory.write(operandAddress, interim & mask, false)
}

export function aug (memory: Memory, operandAddress: MemoryRef): void {
  // AUG either increments or decrements the value at the given address, so as to
  // increase its absolute value by 1.
  // For example, 3 -> 4 but -6 -> -7.
  // If the target is a 16 bit register, this can trigger the overflow condition.
  // NOTE: I can't find a consensus as to how 15 bit values behave on overflow.
  // The AGC 4 manual (as well as O'Brien and the yaYUL manual) either don't specify,
  // or they say that the operation is applied to the 14 bit value plus the sign;
  // however, the yaYUL code seems to sign extend 15 bit values and then perform overflow
  // correction.
  // I can't see any reason to suppose that overflow correction occurs, so I assume
  // that e.g. 0o37777 augs to 0o40000 rather than 0o00000.
  const operand = memory.read(operandAddress, false)

  let mask, shift, delta
  if (isSixteenBit(operandAddress)) {
    mask = 0o177777
    shift = 16
    delta = (operand >= 0o100000) ? 0o177776 : 1
  } else {
    mask = 0o77777
    shift = 15
    delta = (operand >= 0o40000) ? 0o77776 : 1
  }

  let interim = operand + delta
  interim = interim + (interim >>> shift) // End-around carry; see AD
  memory.write(operandAddress, interim & mask, false)
}
