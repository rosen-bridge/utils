export class UnsupportedAddress extends Error {
  constructor(chain: string, address: string) {
    super(
      `UnsupportedAddress: Address [${address}] is not supported in current implementation of [${chain}] chain`
    );
  }
}

export class UnsupportedChain extends Error {
  constructor(chain: string) {
    super(
      `UnsupportedChain: Address encoding does not support [${chain}] chain currently`
    );
  }
}
