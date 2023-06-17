export function assertWidth (value: number, maxWidth: number): void {
  const widthMask = (1 << maxWidth) - 1
  if ((value & widthMask) !== value) {
    throw new ValueTooWideError(value, maxWidth)
  }
}

export function assertShape (value: number, shape: number): void {
  if ((value & shape) !== value) {
    throw new InvalidShapeError(value, shape)
  }
}

export class ValueTooWideError extends Error {
  value: number
  maxWidth: number

  constructor (value: number, maxWidth: number) {
    super(`Value ${value} was too wide (max bits: ${maxWidth})`)
    this.value = value
    this.maxWidth = maxWidth
  }
}

export class InvalidShapeError extends Error {
  value: number
  shape: number

  constructor (value: number, shape: number) {
    const valueBinString: string = (value >>> 0).toString(2).padStart(15, '0')
    const shapeBinString: string = (shape >>> 0).toString(2).padStart(15, '0')
    super(`Value ${value} (${valueBinString} did not have the expected shape ${shapeBinString})`)
    this.value = value
    this.shape = shape
  }
}
