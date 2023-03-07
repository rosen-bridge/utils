import download from 'download';

import { findLatestRelease, findLatestStableRelease } from './utils/github';
import { isValidAssetName, truncateAssetName } from './utils/rosen';

import { RosenAssetsDownloadError } from './error';

/**
 * Download all required Rosen assets (tokenMap and all chain address files) to a specific path
 * @param chainType chain type (e.g. mainnet, testnet, etc.)
 * @param includePrereleases weather to include prereleases into account when searching for a matching release in GitHub
 * @param destinationPath path to folder in which the files will be saved
 * @param nameSuffix an optional suffix to append to saved files names
 */
const downloadRosenAssets = async (
  chainType: string,
  destinationPath: string,
  includePrereleases = false,
  nameSuffix?: string
) => {
  try {
    const release = includePrereleases
      ? await findLatestRelease(chainType)
      : await findLatestStableRelease(chainType);

    if (release) {
      await Promise.all([
        ...(release &&
          release.assets
            .filter((asset) => isValidAssetName(chainType)(asset.name))
            .map(async (asset) =>
              download(asset.browser_download_url, destinationPath, {
                filename: truncateAssetName(asset.name, nameSuffix),
              })
            )),
      ]);
    } else {
      console.error(`No release found for [${chainType}] chain type.`);
      if (!includePrereleases) {
        console.error(
          'Please note that `includePrereleases` is set to false. There may be some matching releases in prereleases.'
        );
      }
    }
  } catch (error) {
    console.error(
      `An error occurred while trying to download Rosen assets: ${error}`
    );
    if (error instanceof Error) {
      console.error(error.stack);
    }
    throw new RosenAssetsDownloadError('', { cause: error });
  }
};

export default downloadRosenAssets;
