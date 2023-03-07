import { Octokit } from 'octokit';

import {
  CONTRACT_REPO_NAME,
  DEFAULT_RELEASES_FETCHING_PAGE_SIZE,
  ROSEN_BRIDGE_ORGANIZATION,
} from '../constants';

import { GithubRelease } from '../types';

/**
 * Fetch a page of releases from Github Api in each iteration until there are no
 * more releases.
 * @param pageSize
 */
async function* fetchReleasesPage(
  pageSize = DEFAULT_RELEASES_FETCHING_PAGE_SIZE
) {
  const octokit = new Octokit();

  let currentPage = 1;

  while (true) {
    const releasesPage = await octokit.rest.repos.listReleases({
      owner: ROSEN_BRIDGE_ORGANIZATION,
      repo: CONTRACT_REPO_NAME,
      per_page: pageSize,
      page: currentPage,
    });

    if (releasesPage.data.length) {
      yield releasesPage.data;
      currentPage += 1;
    } else {
      return;
    }
  }
}

/**
 * Find the last release matching the predicate. If all releases are iterated and
 * no matching release is found, return null.
 * @param predicate
 */
const findLastRelease = async (
  predicate: (release: GithubRelease) => boolean = () => true
) => {
  const releasesPageIterator = fetchReleasesPage();

  for await (const releasesPage of releasesPageIterator) {
    const foundRelease = releasesPage.find(predicate);

    if (foundRelease) {
      return foundRelease;
    }
  }
  return null;
};

/**
 * Check if an asset name matches a specific chain type
 * @param chainType
 */
const assetNameMatchesChainType = (chainType: string) => (assetName: string) =>
  new RegExp(`contracts-.+-${chainType}-.+.json`).test(assetName);

/**
 * Return a function which checks if a release has at least one asset for a
 * specific chain type
 * @param chainType
 * @param release
 */
const hasAssetForChainType = (chainType: string) => (release: GithubRelease) =>
  release.assets
    .map((asset) => asset.name)
    .some(assetNameMatchesChainType(chainType));

/**
 * Return a function which checks if a release is a stable (that is, non-prerelease)
 * and has some asset matching a specific chain type
 * @param chainType
 */
const isStableReleaseForChainType =
  (chainType: string) => (release: GithubRelease) =>
    !release.prerelease && hasAssetForChainType(chainType)(release);

/**
 * Find latest release (prerelease or non-prerelease) having some asset matching
 * a specific chain type
 * @param chainType
 */
const findLatestRelease = async (chainType: string) =>
  findLastRelease(hasAssetForChainType(chainType));

/**
 * Find latest stable (that is, non-prerelease) release having some asset matching
 * a specific chain type
 * @param chainType
 */
const findLatestStableRelease = async (chainType: string) =>
  findLastRelease(isStableReleaseForChainType(chainType));

export {
  assetNameMatchesChainType,
  fetchReleasesPage,
  findLastRelease,
  findLatestRelease,
  findLatestStableRelease,
  hasAssetForChainType,
  isStableReleaseForChainType,
};
