/**
 * converts a hex string to Uint8Array bytes
 *
 * @param {string} hex
 * @return {Uint8Array}
 */
export const hexToUint8Array = (hex: string): Uint8Array =>
  Uint8Array.from(Buffer.from(hex, 'hex'));
