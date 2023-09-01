export class MemoryBank {
  _banks: number[][]

  constructor (numBanks: number, bankSize: number) {
    this._banks = new Array<number[]>(numBanks)
    for (let bankIdx = 0; bankIdx < numBanks; bankIdx++) {
      this._banks[bankIdx] = new Array<number>(bankSize).fill(0)
    }
  }

  getBank (bankIdx: number): number[] {
    if (!Number.isInteger(bankIdx) || bankIdx < 0 || bankIdx >= this._banks.length) {
      throw new InvalidBankError(bankIdx, this._banks.length)
    }

    return this._banks[bankIdx]
  }

  get numBanks (): number {
    return this._banks.length
  }

  get bankSize (): number {
    return this._banks[0].length
  }
}

export class InvalidBankError extends Error {
  constructor (bankIdx: number, maxBank: number) {
    super(`Invalid bank index ${bankIdx}: must be an integer in the range 0 <= x < ${maxBank}`)
  }
}
