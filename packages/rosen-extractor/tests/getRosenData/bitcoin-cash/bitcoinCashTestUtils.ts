/** Encode a canonical direct push or PUSHDATA1 fixture. */
export const push = (data: Buffer): string =>
  `6a${data.length <= 75 ? data.length.toString(16).padStart(2, '0') : `4c${data.length.toString(16)}`}${data.toString('hex')}`;
