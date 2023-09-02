import { Registers } from "./registers";
import { ValueTooWideError } from "../../bitutils/bitAsserts";

let registers = new Registers()

beforeEach(() => {
    registers = new Registers()
})

test('Set and get register A', () => {
  registers.A = 0o54321
  expect(registers.A).toEqual(0o54321)  
})

test('Register A allows 16 bit values', () => {
    expect(() => registers.A = 0o154321).not.toThrow()
    expect(registers.A).toEqual(0o154321)
})

test('Register A forbids 17 bit values', () => {
    expect(() => registers.A = 0o200000).toThrow(ValueTooWideError)
})

test('Set and get register L', () => {
    registers.L = 0o54321
    expect(registers.L).toEqual(0o54321)  
})

test('Register L allows 16 bit values, but truncates them', () => {
    expect(() => registers.L = 0o154321).not.toThrow()
    expect(registers.L).toEqual(0o54321)
})

test('Register L forbids 17 bit values', () => {
    expect(() => registers.L = 0o200000).toThrow(ValueTooWideError)
})

test('Set and get register Q', () => {
    registers.Q = 0o54321
    expect(registers.Q).toEqual(0o54321)  
})
  
test('Register Q allows 16 bit values', () => {
    expect(() => registers.Q = 0o154321).not.toThrow()
    expect(registers.Q).toEqual(0o154321)
})

test('Register Q forbids 17 bit values', () => {
    expect(() => registers.Q = 0o200000).toThrow(ValueTooWideError)
})

test('Set and get EBANK (#1)', () => {
    registers.EBANK = 0o3400
    expect(registers.EBANK).toEqual(0o3400)
})

test('Set and get EBANK (#2)', () => {
    registers.EBANK = 0o1000
    expect(registers.EBANK).toEqual(0o1000)
})

test('Set and get EBANK (#3)', () => {
    registers.EBANK = 0o2400
    expect(registers.EBANK).toEqual(0o2400)
})

test('EBANK masks unwanted bits', () => {
    registers.EBANK = 0o77777
    expect(registers.EBANK = 0o3400)
})

test('Register EBANK rejects 16 bit values', () => {
    expect(() => registers.EBANK = 0o100000).toThrow(ValueTooWideError)
})

test('Set and get FBANK (#1)', () => {
    registers.FBANK = 0o76000
    expect(registers.FBANK).toEqual(0o76000)
})

test('Set and get FBANK (#2)', () => {
    registers.FBANK = 0o52000
    expect(registers.FBANK).toEqual(0o52000)
})

test('Set and get FBANK (#3)', () => {
    registers.FBANK = 0o34000
    expect(registers.FBANK).toEqual(0o34000)
})

test('FBANK masks unwanted bits', () => {
    registers.FBANK = 0o77777
    expect(registers.FBANK = 0o76000)
})

test('Register FBANK rejects 16 bit values', () => {
    expect(() => registers.FBANK = 0o100000).toThrow(ValueTooWideError)
})

test('Set and get register Z', () => {
    registers.Z = 0o5432
    expect(registers.Z).toEqual(0o5432)  
  })
  
test('Register Z masks the top 3 bits', () => {
    expect(() => registers.Z = 0o75432).not.toThrow()
    expect(registers.Z).toEqual(0o5432)
})

test('Register Z forbids 16 bit values', () => {
    expect(() => registers.Z = 0o100000).toThrow(ValueTooWideError)
})

test('Set and get BBANK (#1)', () => {
    registers.BBANK = 0o76007
    expect(registers.BBANK).toEqual(0o76007)
})

test('Set and get BBANK (#2)', () => {
    registers.BBANK = 0o52003
    expect(registers.BBANK).toEqual(0o52003)
})

test('BBANK masks unused bits', () => {
    registers.BBANK = 0o77777
    expect(registers.BBANK).toEqual(0o76007)
})

test('BBANK forbids 16 bit values', () => {
    expect(() => registers.BBANK = 0o100000).toThrow(ValueTooWideError)
})

test('BBANK sets EBANK and FBANK (#1)', () => {
    registers.BBANK = 0o76007
    expect(registers.FBANK).toEqual(0o76000)
    expect(registers.EBANK).toEqual(0o3400)
})

test('BBANK sets EBANK and FBANK (#2)', () => {
    registers.BBANK = 0o52003
    expect(registers.FBANK).toEqual(0o52000)
    expect(registers.EBANK).toEqual(0o1400)
})