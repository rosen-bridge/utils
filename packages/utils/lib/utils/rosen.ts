/**
 * Check if an asset name is a valid Rosen asset name and matches a specific
 * chain type
 * @param chainType
 */
export const isValidAssetName = (chainType: string) => (assetName: string) =>
  new RegExp(`(contracts-.+|tokensMap)-${chainType}-.+.json`).test(assetName);

/**
 * Check if an OS name is a valid supported tss OS
 * @param OSName
 */
export const isValidOS = (OSName: string) => (releaseAssetName: string) =>
  new RegExp(`(rosenTss-${OSName}-.+).zip`).test(releaseAssetName);

/**
 * Remove chain type and tag from the asset name and optionally replaces them
 * with a suffix
 * @param assetName
 * @param chainType
 * @param releaseName
 * @param alternativeSuffix a suffix which will be added before `.json` (if provided)
 */
export const truncateAssetName = (
  assetName: string,
  chainType: string,
  releaseName: string,
  alternativeSuffix?: string
) => {
  const name = assetName.replace(`-${chainType}-${releaseName}.json`, '');
  return alternativeSuffix
    ? `${name}-${alternativeSuffix}.json`
    : `${name}.json`;
};
