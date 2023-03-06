import { Octokit } from 'octokit';

import {
  CONTRACT_REPO_NAME,
  DEFAULT_RELEASES_FETCHING_PAGE_SIZE,
  ROSEN_BRIDGE_ORGANIZATION,
} from '../constants';

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

export { fetchReleasesPage };
