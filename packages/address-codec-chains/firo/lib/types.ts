export class UnsupportedAddressError extends Error {
  constructor(chain: string, address: string, reason?: string) {
    super(
      `UnsupportedAddressError: Address [${address}] is not supported in current implementation of [${chain}] chain` +
        (reason ? ` (${reason})` : ''),
    );
  }
}
