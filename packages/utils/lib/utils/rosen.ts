/**
 * Check if an asset name is a valid Rosen asset name and matches a specific
 * chain type
 * @param chainType
 */
export const isValidAssetName = (chainType: string) => (assetName: string) =>
  new RegExp(`(contracts-.+|tokensMap)-${chainType}-.+.json`).test(assetName);

/**
 * Remove chain type and tag from the asset name and optionally replaces them
 * with a suffix
 * @param assetName
 * @param alternativeSuffix a suffix which will be added before `.json` (if provided)
 */
export const truncateAssetName = (
  assetName: string,
  alternativeSuffix?: string
) =>
  assetName.replace(
    /(contracts-.+?|tokensMap)-.+.json/,
    alternativeSuffix ? `$1-${alternativeSuffix}.json` : '$1.json'
  );
