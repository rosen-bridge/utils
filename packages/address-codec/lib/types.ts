export class UnsupportedChainError extends Error {
  constructor(chain: string) {
    super(
      `UnsupportedChainError: Address encoding does not support [${chain}] chain currently`,
    );
  }
}
