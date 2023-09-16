import { Environment } from '../../environment'
import { Memory, type MemoryRef } from '../memory/memory'
import { ad, aug, com, dim, incr, su } from './instructions'

let memory: Memory

// The address of register A.
const addr0: MemoryRef = {
  kind: 'direct',
  address: 0
}

// The address of register L.
const addr1: MemoryRef = {
  kind: 'direct',
  address: 1
}

// The address of register Q.
const addr2: MemoryRef = {
  kind: 'direct',
  address: 2
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
  expect(memory.registers.A).toEqual(0o177776)
})

test('Test AD [(+1) + (-1) = (-0)]', () => {
  memory.registers.A = 1
  memory.write(addr0o100, 0o77776)
  ad(memory, addr0o100)
  expect(memory.registers.A).toEqual(0o177777)
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

test('Test AD [(-1) + (+2) = (+1)]', () => {
  // No overflow occurs here.
  memory.registers.A = 0o177776
  memory.write(addr0o100, 0o2)
  ad(memory, addr0o100)
  expect(memory.registers.A).toEqual(0o1)
})

test('Test DOUBLE during positive overflow condition', () => {
  // Negative number, but bit 16 is low.
  // This would happen if A overflowed during a sum of large positive integers.
  // This test ensures A doesn't get sign-extended prior to the doubling.
  // Note that as a result, the final answer is mathematically incorrect.
  memory.registers.A = 0o77776
  ad(memory, addr0)
  expect(memory.registers.A).toEqual(0o177774)
})

test('Test DOUBLE during negative overflow condition', () => {
  // Positive number, but bit 16 is high.
  // This would happen if A overflowed during a sum of large negative integers.
  // This test ensures A doesn't get sign-extended prior to the doubling.
  // Note that as a result, the final answer is mathematically incorrect.
  memory.registers.A = 0o100002
  ad(memory, addr0)
  expect(memory.registers.A).toEqual(0o000005)
})

test('Test AD Q preserves Q bit 16', () => {
  // The overflow bit of Q also gets included in AD.
  memory.registers.Q = 0o100000
  ad(memory, addr2)
  expect(memory.registers.Q).toEqual(0o100000)
})

test('Test AD does not modify operand', () => {
  memory.registers.L = 0o60
  ad(memory, addr1)
  expect(memory.registers.L).toEqual(0o60)
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
  // Bit 16 is still incrementable,
  // and so we roll fully over from (-0) to (+1).
  memory.registers.A = 0o177777
  incr(memory, addr0)
  expect(memory.registers.A).toEqual(0o000001)
})

test('Test INCR A (when A is in an overflow state)', () => {
  // No overflow correction occurs.
  memory.registers.A = 0o40000
  incr(memory, addr0)
  expect(memory.registers.A).toEqual(0o40001)
})

test('Test INCR Q', () => {
  memory.registers.Q = 0o140000
  incr(memory, addr2)
  expect(memory.registers.Q).toEqual(0o140001)
})

test('Test INCR L', () => {
  memory.registers.L = 0o47776
  incr(memory, addr1)
  expect(memory.registers.L).toEqual(0o47777)
})

test('Test INCR L to overflow', () => {
  memory.registers.L = 0o37777
  incr(memory, addr1)
  expect(memory.registers.L).toEqual(0o40000)
})

test('Test INCR L rollover', () => {
  memory.registers.L = 0o77777 // -0
  incr(memory, addr1)
  expect(memory.registers.L).toEqual(0o00001) // +1
})

test('Test INCR 0o100', () => {
  memory.write(addr0o100, 0o12345)
  incr(memory, addr0o100)
  expect(memory.read(addr0o100)).toEqual(0o12346)
})

test('Test INCR 0o100 overflow', () => {
  memory.write(addr0o100, 0o37777)
  incr(memory, addr0o100)
  expect(memory.read(addr0o100)).toEqual(0o40000)
})

test('Test INCR 0o100 rollover', () => {
  memory.write(addr0o100, 0o77777) // -0
  incr(memory, addr0o100)
  expect(memory.read(addr0o100)).toEqual(0o00001)
})

test('Test INCR 0o40000', () => {
  memory.write(addr0o100, 0o40000)
  incr(memory, addr0o100)
  expect(memory.read(addr0o100)).toEqual(0o40001)
})

test('Test AUG A (when A is +0)', () => {
  memory.registers.A = 0
  aug(memory, addr0)
  expect(memory.registers.A).toEqual(1)
})

test('Test AUG A (when A is +1)', () => {
  memory.registers.A = 1
  aug(memory, addr0)
  expect(memory.registers.A).toEqual(2)
})

test('Test AUG A (when A is -0)', () => {
  memory.registers.A = 0o177777
  aug(memory, addr0)
  expect(memory.registers.A).toEqual(0o177776) // i.e. -1
})

test('Test AUG A (when A is -1)', () => {
  memory.registers.A = 0o177776
  aug(memory, addr0)
  expect(memory.registers.A).toEqual(0o177775) // i.e. -2
})

test('Test AUG A positive overflow', () => {
  // Here, +0o37777 overflows to -0o37777.
  // Bit 16 remains unset, indicating that the overflow condition is present.
  memory.registers.A = 0o37777
  aug(memory, addr0)
  expect(memory.registers.A).toEqual(0o40000)
})

test('Test AUG A negative overflow', () => {
  // Here, -0o37777 overflows to +0o37777.
  // Bit 16 remains set, indicating that the overflow condition is present.
  memory.registers.A = 0o140000
  aug(memory, addr0)
  expect(memory.registers.A).toEqual(0o137777)
})

test('Test AUG A treats bit 16 as a sign bit #1', () => {
  // I think how this is supposed to work is that in the event of an overflow condition,
  // i.e. a difference between bits 16 and 15, AUG will treat the 16th bit as the 'true'
  // sign, using that to decide whether to increment or decrement the value.
  // This means that for example if you repeatedly run AUG A when A is 0o37777,
  // you will increment to 0o40000, 0o40001, etc.
  // If instead AUG respected the 15th bit you'd see oscillation about the overflow point,
  // since 0o37777 would go to 0o40000 but then 0o40000 would be seen as negative and
  // would decrement, overflowing in the opposite direction back to 0o37777 again.
  memory.registers.A = 0o40000
  aug(memory, addr0)
  expect(memory.registers.A).toEqual(0o40001)
})

test('Test AUG A treats bit 16 as a sign bit #2', () => {
  // As with the previous test, but this time with negative overflow condition.
  memory.registers.A = 0o100001
  aug(memory, addr0)
  expect(memory.registers.A).toEqual(0o100000)
})

test('Test AUG A rollover #1', () => {
  memory.registers.A = 0o77777
  aug(memory, addr0)
  expect(memory.registers.A).toEqual(0o100000)
})

test('Test Aug A rollover #2', () => {
  memory.registers.A = 0o100000
  aug(memory, addr0)
  expect(memory.registers.A).toEqual(0o77777)
})

test('Test AUG Q', () => {
  memory.registers.Q = 0o35
  aug(memory, addr2)
  expect(memory.registers.Q).toEqual(0o36)
})

test('Test AUG Q overflow', () => {
  memory.registers.Q = 0o37777
  aug(memory, addr2)
  expect(memory.registers.Q).toEqual(0o40000)
})

test('Test AUG Q uses bit 16 as sign', () => {
  memory.registers.Q = 0o40000
  aug(memory, addr2)
  expect(memory.registers.Q).toEqual(0o40001)
})

test('Test AUG L overflow', () => {
  // See the function comments on aug(...) for discussion of this case.
  memory.registers.L = 0o37777
  aug(memory, addr1)
  expect(memory.registers.L).toEqual(0o40000)
})

test('Test AUG L overflow #2', () => {
  // See the function comments on aug(...) for discussion of this case.
  memory.registers.L = 0o40000
  aug(memory, addr1)
  expect(memory.registers.L).toEqual(0o37777)
})

test('Test AUG 0o100', () => {
  memory.write(addr0o100, 0o77777)
  aug(memory, addr0o100)
  expect(memory.read(addr0o100)).toEqual(0o77776)
})

test('Test AUG 0o100 overflow', () => {
  // See the function comments on aug(...) for discussion of this case.
  memory.write(addr0o100, 0o37777)
  aug(memory, addr0o100)
  expect(memory.read(addr0o100)).toEqual(0o40000)
})

test('Test DIM A (when A is +1)', () => {
  // Unlike you might expect, DIM of +1 is -0.
  memory.registers.A = 1
  dim(memory, addr0)
  expect(memory.registers.A).toEqual(0o177777)
})

test('Test DIM A leaves +0 unchanged', () => {
  memory.registers.A = 0
  dim(memory, addr0)
  expect(memory.registers.A).toEqual(0)
})

test('Test DIM A leaves -0 unchanged', () => {
  memory.registers.A = 0o177777
  dim(memory, addr0)
  expect(memory.registers.A).toEqual(0o177777)
})

test('Test DIM A (when A is -1)', () => {
  memory.registers.A = 0o177776
  dim(memory, addr0)
  expect(memory.registers.A).toEqual(0o177777) // i.e. -0
})

test('DIM A (when A is -2)', () => {
  memory.registers.A = 0o177775
  dim(memory, addr0)
  expect(memory.registers.A).toEqual(0o177776) // i.e. -1
})

test('Test DIM A treats bit 16 as a sign bit #1', () => {
  // As with AUG A, I believe the 16th bit is used as the sign, so in the event of an
  // overflow condition, bit 16 rather than 15 determines whether an increment or a decrement occurs.
  memory.registers.A = 0o77775
  dim(memory, addr0)
  expect(memory.registers.A).toEqual(0o77774)
})

test('Test DIM A treats bit 16 as a sign bit #2', () => {
  memory.registers.A = 0o100001
  dim(memory, addr0)
  expect(memory.registers.A).toEqual(0o100002)
})

test('Test DIM A rollover (#1)', () => {
  // If A is +0, but bit 16 is equal to 1 (i.e. if a really big positive rollover occurred)
  // then DIM should still see the value as a zero and not modify it.
  // (I think, anyway. It's not documented anywhere I can find.)
  memory.registers.A = 0o100000
  dim(memory, addr0)
  expect(memory.registers.A).toEqual(0o100000)
})

test('Test DIM A rollover (#2)', () => {
  // If A is -0, but bit 16 is equal to 0 (i.e. if a really big negative rollover occurred)
  // then DIM should still see the value as a zero and not modify it.
  // (I think, anyway. It's not documented anywhere I can find.)
  memory.registers.A = 0o077777
  dim(memory, addr0)
  expect(memory.registers.A).toEqual(0o077777)
})

test('Test DIM Q', () => {
  memory.registers.Q = 0o35
  dim(memory, addr2)
  expect(memory.registers.Q).toEqual(0o34)
})

test('Test DIM Q uses bit 16 as sign', () => {
  memory.registers.Q = 0o40001
  dim(memory, addr2)
  expect(memory.registers.Q).toEqual(0o40000)
})

test('Test DIM L', () => {
  memory.write(addr1, 0o76543)
  dim(memory, addr1)
  expect(memory.registers.L).toEqual(0o76544)
})

test('Test DIM 0o100', () => {
  memory.write(addr0o100, 0o77776)
  dim(memory, addr0o100)
  expect(memory.read(addr0o100)).toEqual(0o77777)
})

test('Test SU ([+0o10] - [+0o05] == [+0o03])', () => {
  memory.registers.A = 0o10
  memory.write(addr0o100, 0o03)
  su(memory, addr0o100)
  expect(memory.registers.A).toEqual(0o05)
})

test('Test SU ([+0o10] - [-0o03] == [+0o13])', () => {
  memory.registers.A = 0o10
  memory.write(addr0o100, 0o77774)
  su(memory, addr0o100)
  expect(memory.registers.A).toEqual(0o13)
})

test('Test SU ([+0o33] - [-0o0] == [+0o33])', () => {
  memory.registers.A = 0o33
  memory.write(addr0o100, 0o77777)
  su(memory, addr0o100)
  expect(memory.registers.A).toEqual(0o33)
})

test('Test SU ([+0o33] - [+0o0] == [+0o33])', () => {
  memory.registers.A = 0o33
  memory.write(addr0o100, 0o0)
  su(memory, addr0o100)
  expect(memory.registers.A).toEqual(0o33)
})

test('Test SU ([-0o1] - [+0o10] == [-0o11])', () => {
  memory.registers.A = 0o177776
  memory.write(addr0o100, 0o10)
  su(memory, addr0o100)
  expect(memory.registers.A).toEqual(0o177766)
})

test('Test SU positive overflow #1', () => {
  memory.registers.A = 0o37777
  memory.write(addr0o100, 0o77776) // -1
  su(memory, addr0o100)
  expect(memory.registers.A).toEqual(0o040000)
})

test('Test SU positive overflow #2', () => {
  memory.registers.A = 0o10
  memory.write(addr0o100, 0o40000) // -0o37777
  su(memory, addr0o100)
  expect(memory.registers.A).toEqual(0o40007)
})

test('Test SU negative overflow', () => {
  memory.registers.A = 0o140000 // -0o37777
  memory.write(addr0o100, 0o20)
  su(memory, addr0o100)
  expect(memory.registers.A).toEqual(0o137760)
})

test('Test SU L', () => {
  memory.registers.A = 0o50
  memory.registers.L = 0o30
  su(memory, addr1) // Address of reg L
  expect(memory.registers.A).toEqual(0o20)
})

test('Test SU does not touch operand', () => {
  memory.registers.A = 0o50
  memory.registers.L = 0o30
  su(memory, addr1)
  expect(memory.registers.L).toEqual(0o30)
})

test('Test SU Q uses bit 16 of Q', () => {
  memory.registers.A = 0o140000
  memory.registers.Q = 0o130000
  su(memory, addr2)
  expect(memory.registers.A).toEqual(0o10000)
})

test('Test SU A', () => {
  memory.registers.A = 0o12345
  su(memory, addr0)
  expect(memory.registers.A).toEqual(0o177777) // -0
})
