import { assertShape, assertWidth } from '../../bitutils/bitAsserts'
import { cycleLeft, cycleRight, edop, shiftRight } from '../../bitutils/math'

export class Registers {
  _a = 0
  _l = 0
  _q = 0
  _ebank = 0
  _fbank = 0
  _z = 0
  _arupt = 0
  _lrupt = 0
  _qrupt = 0
  _samptime_1 = 0
  _samptime_2 = 0
  _zrupt = 0
  _bbrupt = 0
  _brupt = 0
  _cyr = 0
  _sr = 0
  _cyl = 0
  _edop = 0

  get A (): number {
    return this._a
  }

  set A (value: number) {
    assertWidth(value, 16)
    this._a = value
  }

  get L (): number {
    return this._l
  }

  set L (value: number) {
    assertWidth(value, 16)

    // The 16th bit can be set but is always dropped.
    // See https://www.ibiblio.org/apollo/assembly_language_manual.html
    this._l = value & ((1 << 15) - 1)
  }

  get Q (): number {
    return this._q
  }

  set Q (value: number) {
    assertWidth(value, 16)
    this._q = value
  }

  get EBANK (): number {
    return this._ebank
  }

  set EBANK (value: number) {
    assertShape(value, 0b000_011_100_000_000)
    this._ebank = value
  }

  get FBANK (): number {
    return this._fbank
  }

  set FBANK (value: number) {
    assertWidth(value, 5)
    this._fbank = value
  }

  get Z (): number {
    return this._z
  }

  set Z (value: number) {
    assertWidth(value, 12)
    this._z = value
  }

  get BBANK (): number {
    return (this._fbank << 10) | (this._ebank >>> 8)
  }

  set BBANK (value: number) {
    assertShape(value, 0b111_110_000_000_111)
    this.FBANK = value >>> 10
    this.EBANK = (value & 0b111) << 8
  }

  get ARUPT (): number {
    return this._arupt
  }

  set ARUPT (value: number) {
    assertWidth(value, 15)
    this._arupt = value
  }

  get LRUPT (): number {
    return this._lrupt
  }

  set LRUPT (value: number) {
    assertWidth(value, 15)
    this._lrupt = value
  }

  get QRUPT (): number {
    return this._qrupt
  }

  set QRUPT (value: number) {
    assertWidth(value, 15)
    this._qrupt = value
  }

  get SAMPTIME_1 (): number {
    return this._samptime_1
  }

  set SAMPTIME_1 (value: number) {
    assertWidth(value, 15)
    this._samptime_1 = value
  }

  get SAMPTIME_2 (): number {
    return this._samptime_2
  }

  set SAMPTIME_2 (value: number) {
    assertWidth(value, 15)
    this._samptime_2 = value
  }

  get ZRUPT (): number {
    return this._zrupt
  }

  set ZRUPT (value: number) {
    assertWidth(value, 15)
    this._zrupt = value
  }

  get BBRUPT (): number {
    return this._bbrupt
  }

  set BBRUPT (value: number) {
    assertWidth(value, 15)
    this._bbrupt = value
  }

  get BRUPT (): number {
    return this._brupt
  }

  set BRUPT (value: number) {
    assertWidth(value, 15)
    this._brupt = value
  }

  get CYR (): number {
    return this._cyr
  }

  set CYR (value: number) {
    assertWidth(value, 15)
    this._cyr = cycleRight(value)
  }

  get SR (): number {
    return this._sr
  }

  set SR (value: number) {
    assertWidth(value, 15)
    this._sr = shiftRight(value)
  }

  get CYL (): number {
    return this._cyl
  }

  set CYL (value: number) {
    this._cyl = cycleLeft(value)
  }

  get EDOP (): number {
    return this._edop
  }

  set EDOP (value: number) {
    this._edop = edop(value)
  }
}
