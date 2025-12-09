/**
 * Check if an asset name is a valid Rosen asset name and matches a specific
 * chain type
 * @param chainType chain type of the asset (e.g., mainnet, testnet)
 */
export const isValidAssetName = (chainType: string) => (assetName: string) =>
  new RegExp(`(contracts|tokensMap)-${chainType}-.+.json`).test(assetName);

/**
 * Check if an OS name is a valid supported tss OS
 * @param OSName operating system name to match in release assets (e.g., linux, macOS, windows)
 */
export const isValidOS = (OSName: string) => (releaseAssetName: string) =>
  new RegExp(`(rosenTss-${OSName}-.+).zip`).test(releaseAssetName);

/**
 * Remove chain type and tag from the asset name and optionally replaces them
 * with a suffix
 * @param assetName full asset file name from the release
 * @param chainType chain type used in the asset file name
 * @param releaseName release tag used in naming the asset
 * @param alternativeSuffix a suffix which will be added before `.json` (if provided)
 */
export const truncateAssetName = (
  assetName: string,
  chainType: string,
  releaseName: string,
  alternativeSuffix?: string,
) => {
  const name = assetName.replace(`-${chainType}-${releaseName}.json`, '');
  return alternativeSuffix
    ? `${name}-${alternativeSuffix}.json`
    : `${name}.json`;
};
