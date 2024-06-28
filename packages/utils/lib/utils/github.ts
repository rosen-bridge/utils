import { Octokit } from 'octokit';

import { isValidAssetName } from './rosen';

import {
  DEFAULT_RELEASES_FETCHING_PAGE_SIZE,
  ROSEN_BRIDGE_ORGANIZATION,
} from '../constants';

import { GithubRelease, SupportedRepo } from '../types';

/**
 * Fetch a page of contractReleases from Github Api in each iteration until there are no
 * more contractReleases.
 * @param repoName
 * @param pageSize
 */
async function* fetchReleasesPage(
  repoName: SupportedRepo,
  pageSize = DEFAULT_RELEASES_FETCHING_PAGE_SIZE
) {
  const octokit = new Octokit();

  let currentPage = 1;

  while (true) {
    const releasesPage = await octokit.rest.repos.listReleases({
      owner: ROSEN_BRIDGE_ORGANIZATION,
      repo: repoName,
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
 * Find the last release matching the predicate. If all contractReleases are iterated and
 * no matching release is found, return null.
 * @param repoName
 * @param predicate
 */
const findLastRelease = async (
  repoName: SupportedRepo,
  predicate: (release: GithubRelease) => boolean = () => true
) => {
  const releasesPageIterator = fetchReleasesPage(repoName);

  for await (const releasesPage of releasesPageIterator) {
    const foundRelease = releasesPage.find(predicate);

    if (foundRelease) {
      return foundRelease;
    }
  }
  return null;
};

/**
 * get a GitHub release by its tag
 * @param repoName
 * @param tag
 */
const getReleaseByTag = async (repoName: SupportedRepo, tag: string) => {
  const octokit = new Octokit();
  const release = await octokit.rest.repos.getReleaseByTag({
    owner: ROSEN_BRIDGE_ORGANIZATION,
    repo: repoName,
    tag,
  });

  return release.data;
};

/**
 * Return a function which checks if a release has at least one asset for a
 * specific chain type
 * @param chainType
 * @param release
 */
const hasAssetForChainType = (chainType: string) => (release: GithubRelease) =>
  release.assets.map((asset) => asset.name).some(isValidAssetName(chainType));

/**
 * Return a function which checks if a release is a stable (that is, non-prerelease)
 * and has some asset matching a specific chain type
 * @param chainType
 */
const isStableReleaseForChainType =
  (chainType: string) => (release: GithubRelease) =>
    !release.prerelease && hasAssetForChainType(chainType)(release);

/**
 * Return a function which checks if tagPrefix is matched with release tag_name
 * @param tagPrefix
 */
const hasMatchedTagPrefix = (tagPrefix: string) => (release: GithubRelease) => {
  const regex = new RegExp(`^${tagPrefix}`);
  return regex.test(release.tag_name);
};

/**
 * Return a function which checks if a release is a stable (that is, non-prerelease),
 * and tagPrefix is matched with release tag_name
 * @param tagPrefix
 */
const isStableReleaseForRegexTagType =
  (tagPrefix: string) => (release: GithubRelease) =>
    !release.prerelease && hasMatchedTagPrefix(tagPrefix)(release);

/**
 * Find latest release (prerelease or non-prerelease) having some asset matching
 * a specific chain type
 * @param repoName
 * @param chainType
 */
const findLatestRelease = async (repoName: SupportedRepo, chainType: string) =>
  findLastRelease(repoName, hasAssetForChainType(chainType));

/**
 * Find latest stable (that is, non-prerelease) release having some asset matching
 * a specific chain type
 * @param repoName
 * @param chainType
 */
const findLatestStableRelease = async (
  repoName: SupportedRepo,
  chainType: string
) => findLastRelease(repoName, isStableReleaseForChainType(chainType));

/**
 * Find the latest stable (that is, non-prerelease) release that tagPrefix is matched with release tag_name
 * @param repoName
 * @param tagPrefix
 */
const findLatestStableReleaseByPrefixTag = async (
  repoName: SupportedRepo,
  tagPrefix: string
) => findLastRelease(repoName, isStableReleaseForRegexTagType(tagPrefix));

/**
 * Find the latest release that tagPrefix is matched with release tag_name
 * @param repoName
 * @param tagPrefix
 */
const findLatestReleaseByPrefixTag = async (
  repoName: SupportedRepo,
  tagPrefix: string
) => findLastRelease(repoName, hasMatchedTagPrefix(tagPrefix));

export {
  fetchReleasesPage,
  findLastRelease,
  findLatestRelease,
  findLatestStableRelease,
  findLatestStableReleaseByPrefixTag,
  findLatestReleaseByPrefixTag,
  getReleaseByTag,
  hasAssetForChainType,
  isStableReleaseForChainType,
  isStableReleaseForRegexTagType,
  hasMatchedTagPrefix,
};
