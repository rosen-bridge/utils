import { Octokit } from 'octokit';

import { releases } from '../data/octokit.data';

import { DEFAULT_RELEASES_FETCHING_PAGE_SIZE } from '../../lib/constants';

export const mockOctokit = () =>
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
