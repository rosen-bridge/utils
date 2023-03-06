import { Octokit } from 'octokit';

import {
  fetchReleasesPage,
  assetNameMatchesChainType,
  findLastReleasesWith,
  findLatestAndPrereleaseReleases,
  findLatestRelease,
  hasAssetForChainType,
  isLatestWithChainType,
  isPrereleaseWithChainType,
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

describe('assetNameMatchesChainType', () => {
  /**
   * Target:
   * It should check if asset name matches chain type correctly
   *
   * Dependencies:
   * N/A
   *
   * Scenario:
   * N/A
   *
   * Expected output:
   * N/A
   */
  it('should check if asset name matches chain type correctly', () => {
    const matchAssetName = 'contracts-awesomechain-mainnet-1.json';
    const notMatchAssetName = 'contracts-awesomechain-testnet-1.json';

    expect(assetNameMatchesChainType('mainnet')(matchAssetName)).toBe(true);
    expect(assetNameMatchesChainType('mainnet')(notMatchAssetName)).toBe(false);
  });
});

describe('hasAssetForChainType', () => {
  /**
   * Target:
   * It should check if a release has some assets for chain type correctly
   *
   * Dependencies:
   * N/A
   *
   * Scenario:
   * N/A
   *
   * Expected output:
   * N/A
   */
  it('should check if a release has some assets for chain type correctly', () => {
    expect(hasAssetForChainType('mainnet', releases[0] as any)).toBe(true);
    expect(hasAssetForChainType('mainnet', releases[3] as any)).toBe(false);
  });
});

describe('isLatestWithChainType', () => {
  /**
   * Target:
   * It should check if a release is latest and has some assets for chain type
   * correctly
   *
   * Dependencies:
   * N/A
   *
   * Scenario:
   * N/A
   *
   * Expected output:
   * N/A
   */
  it('should check if a release is latest and has some assets for chain type correctly', () => {
    expect(isLatestWithChainType('mainnet')(releases[0] as any)).toBe(false);
    expect(isLatestWithChainType('mainnet')(releases[1] as any)).toBe(true);
    expect(isLatestWithChainType('mainnet')(releases[3] as any)).toBe(false);
  });
});

describe('isPrereleaseWithChainType', () => {
  /**
   * Target:
   * It should check if a release is prerelease and has some assets for chain
   * type correctly
   *
   * Dependencies:
   * N/A
   *
   * Scenario:
   * N/A
   *
   * Expected output:
   * N/A
   */
  it('should check if a release is prerelease and has some assets for chain type correctly', () => {
    expect(isPrereleaseWithChainType('mainnet')(releases[0] as any)).toBe(true);
    expect(isPrereleaseWithChainType('mainnet')(releases[1] as any)).toBe(
      false
    );
    expect(isPrereleaseWithChainType('mainnet')(releases[3] as any)).toBe(
      false
    );
  });
});

describe('findLatestRelease', () => {
  /**
   * Target:
   * It should find latest release correctly
   *
   * Dependencies:
   * - mocked Octokit
   *
   * Scenario:
   * N/A
   *
   * Expected output:
   * N/A
   */
  it('should find latest release correctly', async () => {
    mockOctokit();

    const latestMainNet = await findLatestRelease('mainnet');
    const latestTestNet = await findLatestRelease('testnet');

    expect(latestMainNet.id).toBe(2);
    expect(latestTestNet.id).toBe(5);
  });
});

describe('findLatestAndPrereleaseRelease', () => {
  /**
   * Target:
   * It should find latest and prerelease releases correctly
   *
   * Dependencies:
   * - mocked Octokit
   *
   * Scenario:
   * N/A
   *
   * Expected output:
   * N/A
   */
  it('should find latest and prerelease releases correctly', async () => {
    mockOctokit();

    const { latest: latestMainNet, prerelease: prereleaseMainNet } =
      await findLatestAndPrereleaseReleases('mainnet');
    const { latest: latestTestNet, prerelease: prereleaseTestNet } =
      await findLatestAndPrereleaseReleases('testnet');

    expect(latestMainNet.id).toBe(2);
    expect(prereleaseMainNet.id).toBe(1);
    expect(latestTestNet.id).toBe(5);
    expect(prereleaseTestNet.id).toBe(4);
  });
});
