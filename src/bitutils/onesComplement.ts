export function signExtend (original: number): number {
  // Set the 16th bit equal to the value of the 15th bit.
  // This is used by overflow-aware calculations, as if overflow onto the 16th bit occurs
  // it will then differ from the 15th bit.
  // Thus we initially set them equal prior to such calculations, so that if they ever differ we will know overflow occurred.
  return (original & 0o77777) | ((original << 1) & 0o100000)
}
