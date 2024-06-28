import { Octokit } from 'octokit';

import { contractReleases, PartialReleases } from '../data/octokit.data';

import { DEFAULT_RELEASES_FETCHING_PAGE_SIZE } from '../../lib/constants';

export const mockOctokit = (releases: any[]) =>
  jest.mocked(Octokit).mockImplementation(() => {
    let page = 0;
    return {
      rest: {
        repos: {
          listReleases: async () => {
            const currentIndex = DEFAULT_RELEASES_FETCHING_PAGE_SIZE * page;
            page += 1;
            return {
              data: releases.slice(currentIndex, currentIndex + 5),
            };
          },
        },
      },
    } as any;
  });

/**
 * mock `getReleaseByTag` of Octokit
 */
export const mockOctokitGetReleaseByTag = (releases: PartialReleases) =>
  jest.mocked(Octokit).mockImplementation(() => {
    return {
      rest: {
        repos: {
          getReleaseByTag: async ({ tag }: { tag: string }) => {
            return {
              data: releases.find((release) => release.tag_name === tag),
            };
          },
        },
      },
    } as any;
  });
