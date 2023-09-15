import { Environment } from "../../environment";
import { Memory, MemoryRef } from "../memory/memory";
import { ad } from "./instructions";

let memory: Memory

const addr_0o100: MemoryRef = {
    kind: 'direct', 
    address: 0o100
}

beforeEach(() => {
    memory = new Memory(Environment.COMMAND_MODULE)
})

test('Test AD [(+0) + (+1) = (+1)]', () => {
    memory.registers.A = 0
    memory.write(addr_0o100, 1)
    ad(memory, addr_0o100)
    expect(memory.registers.A).toEqual(1)
})

test('Test AD [(+0) + (-1) = (-1)]', () => {
    memory.registers.A = 0
    memory.write(addr_0o100, 0o77776)
    ad(memory, addr_0o100)
    expect(memory.registers.A).toEqual(0o77776)
})

test('Test AD [(+1) + (-1) = (-0)]', () => {
    memory.registers.A = 1
    memory.write(addr_0o100, 0o77776)
    ad(memory, addr_0o100)
    expect(memory.registers.A).toEqual(0o77777)
})

test('Test AD [(+0o02000) + (+0o06000) = (+0o10000)', () => {
    // Add large positive numbers, no overflow.
    memory.registers.A = 0o2000
    memory.write(addr_0o100, 0o6000)
    ad(memory, addr_0o100)
    expect(memory.registers.A).toEqual(0o10000)
})

test('Test AD [(+0o22000) + (+0o26000) = (+0o50000)', () => {
    // Add large positive numbers, with overflow.
    memory.registers.A = 0o22000
    memory.write(addr_0o100, 0o26000)
    ad(memory, addr_0o100)
    expect(memory.registers.A).toEqual(0o50000)
})

test('Test AD [(-0o3777) + (-0o7777) = (-0o13776)', () => {
    // Add large negative numbers, with end-around-carry but no overflow.
    memory.registers.A = 0o174000
    memory.write(addr_0o100, 0o70000)
    ad(memory, addr_0o100)
    expect(memory.registers.A).toEqual(0o164001)
})

test('Test AD [(-0o37777) + (-0o30000) = (+0o10000)', () => {
    // Add large negative numbers, with overflow.
    memory.registers.A = 0o140000
    memory.write(addr_0o100, 0o47777)
    ad(memory, addr_0o100)
    expect(memory.registers.A).toEqual(0o110000)
})