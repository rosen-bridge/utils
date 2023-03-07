/**
 * Check if an asset name is a valid Rosen asset name and matches a specific
 * chain type
 * @param chainType
 */
export const isValidAssetName = (chainType: string) => (assetName: string) =>
  new RegExp(`(contracts-.+|tokensMap)-${chainType}-.+.json`).test(assetName);
