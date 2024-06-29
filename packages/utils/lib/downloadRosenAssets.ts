import download from 'download';

import {
  findLatestRelease,
  findLatestStableRelease,
  getReleaseByTag,
} from './utils/github';
import { isValidAssetName, truncateAssetName } from './utils/rosen';

import { RosenAssetsDownloadError } from './error';

const repo = 'contract';

/**
 * Download all required Rosen assets (tokenMap and all chain address files) to a specific path
 * @param chainType chain type (e.g. mainnet, testnet, etc.)
 * @param includePrereleases weather to include prereleases into account when searching for a matching release in GitHub
 * @param config configs for including prereleases, adding name suffix, and getting specific release by tag
 */
const downloadRosenAssets = async (
  chainType: string,
  destinationPath: string,
  config?: {
    includePrereleases?: boolean;
    nameSuffix?: string;
    tag?: string;
  }
) => {
  const getRelease = () => {
    if (config?.tag) return getReleaseByTag(repo, config.tag);
    if (config?.includePrereleases) return findLatestRelease(repo, chainType);
    return findLatestStableRelease(repo, chainType);
  };
  try {
    const release = await getRelease();

    if (release) {
      await Promise.all([
        ...(release &&
          release.assets
            .filter((asset) => isValidAssetName(chainType)(asset.name))
            .map(async (asset) =>
              download(asset.browser_download_url, destinationPath, {
                filename: truncateAssetName(asset.name, config?.nameSuffix),
              })
            )),
      ]);
    } else {
      console.error(`No release found for [${chainType}] chain type.`);
      if (!config?.includePrereleases) {
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
