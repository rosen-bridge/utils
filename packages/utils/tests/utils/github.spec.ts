import { Octokit } from 'octokit';

import { fetchReleasesPage } from '../../lib/utils/github';

import { releases } from './github.data';
import { DEFAULT_RELEASES_FETCHING_PAGE_SIZE } from '../../lib/constants';

jest.mock('octokit');

const mockOctokit = () =>
  (Octokit as jest.MockedClass<typeof Octokit>).mockImplementation(() => {
    let page = 0;
    return {
      rest: {
        repos: {
          listReleases: (async () => {
            const currentIndex = DEFAULT_RELEASES_FETCHING_PAGE_SIZE * page;
            page += 1;
            return {
              data: releases.slice(currentIndex, currentIndex + 5),
            };
          }) as any,
        },
      },
    } as any;
  });

describe('fetchReleasesPage', () => {
  /**
   * Target:
   * It should generate releases correctly
   *
   * Dependencies:
   * - mocked Octokit
   *
   * Scenario:
   * N/A
   *
   * Expected output:
   * The generator function should work as expected
   */
  it('should generate releases correctly', async () => {
    mockOctokit();

    const iterator = fetchReleasesPage();

    expect((await iterator.next()).value?.length).toBe(5);
    expect((await iterator.next()).value?.length).toBe(4);
    expect((await iterator.next()).value).toBe(undefined);
    expect((await iterator.next()).done).toBe(true);
  });
});
