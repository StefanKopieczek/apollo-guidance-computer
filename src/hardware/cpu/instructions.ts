import { signExtend } from "../../bitutils/onesComplement";
import { Memory, MemoryRef } from "../memory/memory";

export function ad(memory: Memory, operandAddress: MemoryRef): void {    
    const acc = memory.registers.A
    const operand = signExtend(memory.read(operandAddress))
    const interim = acc + operand    
    memory.registers.A = (interim & 0o177777) + (interim >>> 16)
}