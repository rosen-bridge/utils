import download from 'download';

import {
  findLatestReleaseByPrefixTag,
  findLatestStableReleaseByPrefixTag,
  getReleaseByTag,
} from './utils/github';
import { isValidOS } from './utils/rosen';

import { RosenAssetsDownloadError } from './error';

const repo = 'sign-protocols';

/**
 * Download release asset by tag to a specific path
 * @param destinationPath where writes files
 * @param config configs for including prereleases, set osName, getting specific release by tag or by regex tag
 */
const downloadTssBinary = async (
  destinationPath: string,
  config: {
    osName: string;
    tag: string;
    regex: boolean;
    includePrereleases?: boolean;
  }
) => {
  const getRelease = () => {
    if (config.regex) {
      if (config?.includePrereleases)
        return findLatestReleaseByPrefixTag(repo, config.tag);
      else return findLatestStableReleaseByPrefixTag(repo, config.tag);
    } else return getReleaseByTag(repo, config.tag);
  };
  try {
    const release = await getRelease();

    if (release) {
      await Promise.all([
        ...(release &&
          release.assets
            .filter((asset) => isValidOS(config.osName)(asset.name))
            .map(async (asset) =>
              download(asset.browser_download_url, destinationPath)
            )),
      ]);
    } else {
      console.error(`No release found for [${config.osName}] OS name.`);
    }
  } catch (error) {
    console.error(
      `An error occurred while trying to download release assets: ${error}`
    );
    if (error instanceof Error) {
      console.error(error.stack);
    }
    throw new RosenAssetsDownloadError('', { cause: error });
  }
};

export { downloadTssBinary };
