import { assertWidth } from './bitAsserts'

export function cycleRight (n: number): number {
  assertWidth(n, 15)
  return ((n & 1) << 14) | (n >>> 1)
}

export function cycleLeft (n: number): number {
  assertWidth(n, 15)
  return (n >>> 14) | ((n << 1) & 0o77776)
}

export function edop (n: number): number {
  assertWidth(n, 15)
  return n >>> 7
}

export function shiftRight (n: number): number {
  assertWidth(n, 15)
  return n >>> 1
}
