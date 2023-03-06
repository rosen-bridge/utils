import { Octokit } from 'octokit';

import {
  fetchReleasesPage,
  findLastReleasesWith,
} from '../../lib/utils/github';

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

describe('findLastReleasesWith', () => {
  /**
   * Target:
   * It should find last releases correctly
   *
   * Dependencies:
   * - mocked Octokit
   *
   * Scenario:
   * N/A
   *
   * Expected output:
   * The function should return correct releases
   */
  it('should find last releases correctly', async () => {
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

    const foundReleases = await findLastReleasesWith([
      (release) => release.id === 2,
      (release) => release.id === 5,
    ]);

    expect(foundReleases[0].id).toBe(2);
    expect(foundReleases[1].id).toBe(5);
  });

  /**
   * Target:
   * It should return null for any predicate with no matching release
   *
   * Dependencies:
   * - mocked Octokit
   *
   * Scenario:
   * N/A
   *
   * Expected output:
   * The function should return null if no matching release is found
   */
  it('should return null for any predicate with no matching release', async () => {
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

    const foundReleases = await findLastReleasesWith([
      (release) => release.id === 100,
      (release) => release.id === 2,
    ]);

    expect(foundReleases[0]).toBe(null);
    expect(foundReleases[1].id).toBe(2);
  });
});
