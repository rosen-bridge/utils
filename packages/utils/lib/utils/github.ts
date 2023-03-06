import { Octokit } from 'octokit';
import { compact } from 'lodash-es';

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
 * For any predicate in a list, find the last release matching that predicate
 * and return corresponding releases list. If all releases are iterated and no
 * matching release is found, return `null` for that predicate.
 * @param predicates a list of predicates we want to find a matching release for
 */
const findLastReleasesWith = async (
  predicates: ((release: GithubRelease) => boolean)[]
) => {
  const releasesPageIterator = fetchReleasesPage();

  const result: GithubRelease[] = Array(predicates.length).fill(null);

  for await (const releasesPage of releasesPageIterator) {
    predicates.forEach((predicate, index) => {
      const foundRelease = releasesPage.find(predicate);
      if (foundRelease) {
        result[index] = foundRelease;
      }
    });

    if (compact(result).length === predicates.length) {
      return result;
    }
  }
  return result;
};

export { fetchReleasesPage, findLastReleasesWith };
