import { assertWidth } from '../../bitutils/bitAsserts'
import { Environment } from '../../environment'
import { MemoryBank } from './memoryBank'
import { Registers } from './registers'

export class Memory {
  environment: Environment
  registers = new Registers()
  erasable = new MemoryBank(8, 0o400)
  fixed = new MemoryBank(36, 0o2000)
  isSuperbankSet = false

  constructor (environment: Environment) {
    this.environment = environment
  }

  read (ref: MemoryRef): number {
    let canonicalRef: BankedRef

    // If the reference is direct, then it either refers to a memory-mapped register,
    // or to a fixed area of memory.
    if (ref.kind === 'direct') {
      if (this.isRegister(ref.address)) {
        return this.readRegister(ref.address)
      } else {
        canonicalRef = this.convertToBanked(ref)
      }
    } else if (ref.kind === 'banked') {
      canonicalRef = ref
    } else {
      // Dead bank
      return 0
    }

    const bankArray = (canonicalRef.memoryType === 'erasable') ? this.erasable : this.fixed
    return bankArray.getBank(canonicalRef.bankId)[canonicalRef.offset]
  }

  write (ref: MemoryRef, value: number): void {
    assertWidth(value, 15)

    let canonicalRef: BankedRef

    // If the reference is direct, then it either refers to a memory-mapped register,
    // or to a fixed area of memory.
    if (ref.kind === 'direct') {
      if (this.isRegister(ref.address)) {
        this.setRegister(ref.address, value)
        return
      } else {
        canonicalRef = this.convertToBanked(ref)
      }
    } else if (ref.kind === 'banked') {
      canonicalRef = ref
    } else {
      // Dead bank
      return
    }

    if (canonicalRef.memoryType === 'fixed') {
      // Writes to fixed memory should silently fail.
      // TODO: confirm whether this should in fact force a reset.
      return
    }

    const bankArray = (canonicalRef.memoryType === 'erasable') ? this.erasable : this.fixed
    bankArray.getBank(canonicalRef.bankId)[canonicalRef.offset] = value
  }

  deduceAddress (instruction: number): MemoryRef {
    const isErasable = (instruction & 0o06000) === 0
    if (isErasable) {
      // Switched erasable memory is used only when bits 10 and 9 are set.
      const isDirect = (instruction & 0o1400) !== 0o1400
      if (isDirect) {
        return {
          kind: 'direct',
          address: instruction & 0o1777 // Last 10 bits of the instruction
        }
      } else {
        return {
          kind: 'banked',
          memoryType: 'erasable',
          bankId: this.registers.EBANK >>> 8,
          offset: instruction & 0o377 // Last 8 bits of the instruction
        }
      }
    } else {
      // Switched fixed-storage memory is used only when bit 12 is low.
      const isDirect = (instruction & 0o4000) > 0
      if (isDirect) {
        return {
          kind: 'direct',
          address: instruction & 0o7777 // Last 12 bits of the instruction
        }
      } else {
        let bankId = this.registers.FBANK >>> 10
        if (bankId >= 0o30 && this.isSuperbankSet) {
          // The superbank bit only applies if the top two bits of the FBANK
          // are 11.
          bankId += 0o10
        }
        if (bankId <= 0o43) {
          return {
            kind: 'banked',
            memoryType: 'fixed',
            bankId,
            offset: instruction & 0o1777 // Last 10 bits of the instruction
          }
        } else {
          // Banks 36, 37, 38 and 39 are addressable, but don't actually exist.
          return { kind: 'deadbank' }
        }
      }
    }
  }

  private convertToBanked (ref: DirectRef): BankedRef {
    if (this.isRegister(ref.address)) {
      throw Error(`Address ${ref.address.toString(8)} points to a register, and can't be converted to a BankedRef`)
    } else if (ref.address < 0o1400) {
      // E0, E1 and E2 are permanently mapped to the start of memory
      // (except where the address maps to a register).
      // They are consecutive, and each occupies 0o400 words.
      return {
        kind: 'banked',
        memoryType: 'erasable',
        bankId: Math.trunc(ref.address / this.erasable.bankSize),
        offset: ref.address % this.erasable.bankSize
      }
    } else if ((ref.address >= 0o4000) && (ref.address < 0o10000)) {
      // F2 and F3 are permanently mapped to 0o4000-0o5777 and 0o6000-0o7777 respectively.
      const bankId = ref.address < 0o6000 ? 2 : 3
      return {
        kind: 'banked',
        memoryType: 'fixed',
        bankId,
        offset: ref.address - 0o4000 - (bankId === 2 ? 0 : 0o2000)
      }
    } else {
      throw new AddressOutOfBoundsError(`Invalid direct reference address ${ref.address.toString(8)}`)
    }
  }

  private isRegister (address: number): boolean {
    return (
      address < 0o55 ||
      address === 0o57 ||
      (this.environment === Environment.LUNAR_MODULE &&
        (address === 0o55 || address === 0o56 || address === 60)))
  }

  private readRegister (address: number): number {
    if (!this.isRegister(address)) {
      throw new AddressOutOfBoundsError(`${address.toString(8)} is not a valid register address in the ${this.environment} environment`)
    }

    switch (address) {
      case 0o0:
        // The 16th bit of the accumulator is inaccessible on read.
        return this.registers.A & (0o77777)
      case 0o1:
        return this.registers.L
      case 0o2:
        // The 16th bit of the Q register is inaccessible on read.
        return this.registers.Q & (0o77777)
      case 0o3:
        return this.registers.EBANK
      case 0o4:
        return this.registers.FBANK
      case 0o5:
        return this.registers.Z
      case 0o6:
        return this.registers.BBANK
      case 0o7:
        // 0o7 is a source of zeros.
        return 0
      case 0o10:
        return this.registers.ARUPT
      case 0o11:
        return this.registers.LRUPT
      case 0o12:
        return this.registers.QRUPT
      case 0o13:
        return this.registers.SAMPTIME_1
      case 0o14:
        return this.registers.SAMPTIME_2
      case 0o15:
        return this.registers.ZRUPT
      case 0o16:
        return this.registers.BBRUPT
      case 0o17:
        return this.registers.BRUPT
      case 0o20:
        return this.registers.CYR
      case 0o21:
        return this.registers.SR
      case 0o22:
        return this.registers.CYL
      case 0o23:
        return this.registers.EDOP
      default:
        // TODO
        throw new Error(`Register access ${address.toString(8)} not implemented`)
    }
  }

  private setRegister (address: number, value: number): void {
    assertWidth(value, 15)

    if (!this.isRegister(address)) {
      throw new AddressOutOfBoundsError(`${address.toString(8)} is not a valid register address in the ${this.environment} environment`)
    }

    switch (address) {
      case 0o0:
        this.registers.A = value
        break
      case 0o1:
        this.registers.L = value
        break
      case 0o2:
        this.registers.Q = value
        break
      case 0o3:
        this.registers.EBANK = value
        break
      case 0o4:
        this.registers.FBANK = value
        break
      case 0o5:
        this.registers.Z = value & 0o7777
        break
      case 0o6:
        this.registers.BBANK = value & 0b111_110_000_000_111
        break
      case 0o7:
        break
      case 0o10:
        this.registers.ARUPT = value
        break
      case 0o11:
        this.registers.LRUPT = value
        break
      case 0o12:
        this.registers.QRUPT = value
        break
      case 0o13:
        this.registers.SAMPTIME_1 = value
        break
      case 0o14:
        this.registers.SAMPTIME_2 = value
        break
      case 0o15:
        this.registers.ZRUPT = value
        break
      case 0o16:
        this.registers.BBRUPT = value
        break
      case 0o17:
        this.registers.BRUPT = value
        break
      case 0o20:
        this.registers.CYR = value
        break
      case 0o21:
        this.registers.SR = value
        break
      case 0o22:
        this.registers.CYL = value
        break
      case 0o23:
        this.registers.EDOP = value
        break
      default:
        // TODO
        throw new Error(`Register access ${address.toString(8)} not implemented`)
    }
  }
}

/**
 * A reference to a memory location.
 * Program instructions by themselves don't contain enough information
 * to unambiguously reference memory locations - the state of the EBANK/FBANK
 * registers and the SUPERBANK bit need to be taken into account.
 * Additionally the address data inside the instructions is highly compact.
 *
 * Therefore we introduce MemoryRefs as a clearer, unambiguous way of
 * identifying specific locations in memory.
 *
 * Note 1: IO channels are not memory mapped, and so cannot be expressed as
 * MemoryRefs.
 *
 * Note 2: Since certain addresses (erasable banks 0-2 and fixed banks 2-3) can be
 * addressed either without banking (DirectRef) or with banking (BankedRef),
 * it's possible for two different MemoryRefs to point to the same memory cell.
 **/
export type MemoryRef = DirectRef | BankedRef | DeadBank

export interface DirectRef {
  /**
   * A reference to unbanked memory: either a memory mapped register or an unswitched
   * location.
   * It is forbidden to use a DirectRef to point into switched memory.
   */
  readonly kind: 'direct'
  readonly address: number
}

export interface BankedRef {
  readonly kind: 'banked'
  readonly memoryType: 'erasable' | 'fixed'
  readonly bankId: number
  readonly offset: number
}

export interface DeadBank {
  /**
   * A reference to a bank that does not exist.
   * Writes should be dropped; reads should return all 0s.
   */
  readonly kind: 'deadbank'
}

export class AddressOutOfBoundsError extends Error {}
