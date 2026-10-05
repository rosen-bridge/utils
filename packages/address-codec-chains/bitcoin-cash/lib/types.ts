export class UnsupportedAddressError extends Error {
  /** Describe the chain, rejected address and optional validation failure reason. */
  constructor(chain: string, address: string, reason?: string) {
    super(
      `UnsupportedAddressError: Address [${address}] is not supported in current implementation of [${chain}] chain` +
        (reason ? ` (${reason})` : ''),
    );
  }
}
