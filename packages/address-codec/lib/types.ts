export class UnsupportedAddressError extends Error {
  constructor(chain: string, address: string) {
    super(
      `UnsupportedAddressError: Address [${address}] is not supported in current implementation of [${chain}] chain`
    );
  }
}

export class UnsupportedChainError extends Error {
  constructor(chain: string) {
    super(
      `UnsupportedChainError: Address encoding does not support [${chain}] chain currently`
    );
  }
}
