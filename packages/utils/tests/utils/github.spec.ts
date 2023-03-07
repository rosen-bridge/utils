import { Octokit } from 'octokit';

import {
  fetchReleasesPage,
  assetNameMatchesChainType,
  findLatestRelease,
  hasAssetForChainType,
  findLastRelease,
  isStableReleaseForChainType,
  findLatestStableRelease,
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

describe('findLastReleaseWith', () => {
  /**
   * Target:
   * It should find last release correctly
   *
   * Dependencies:
   * - mocked Octokit
   *
   * Scenario:
   * N/A
   *
   * Expected output:
   * The function should return correct release
   */
  it('should find last releases correctly', async () => {
    mockOctokit();

    const foundReleases = await findLastRelease((release) => release.id === 2);

    expect(foundReleases?.id).toBe(2);
  });

  /**
   * Target:
   * It should return last release if no predicate is provided
   *
   * Dependencies:
   * - mocked Octokit
   *
   * Scenario:
   * N/A
   *
   * Expected output:
   * The function should return correct release
   */
  it('should return last release if no predicate is provided', async () => {
    mockOctokit();

    const foundReleases = await findLastRelease();

    expect(foundReleases?.id).toBe(1);
  });

  /**
   * Target:
   * It should return null if no matching release is found
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
  it('should return null if no matching release is found', async () => {
    mockOctokit();

    const foundReleases = await findLastRelease(
      (release) => release.id === 100
    );

    expect(foundReleases).toBe(null);
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
    expect(hasAssetForChainType('mainnet')(releases[0] as any)).toBe(true);
    expect(hasAssetForChainType('mainnet')(releases[3] as any)).toBe(false);
  });
});

describe('isStableReleaseForChainType', () => {
  /**
   * Target:
   * It should check if a release is stable (that is, non-prerelease) and has
   * some assets for chain type correctly
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
  it('should check if a release is stable and has some assets for chain type correctly', () => {
    expect(isStableReleaseForChainType('mainnet')(releases[0] as any)).toBe(
      false
    );
    expect(isStableReleaseForChainType('mainnet')(releases[1] as any)).toBe(
      true
    );
    expect(isStableReleaseForChainType('mainnet')(releases[3] as any)).toBe(
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

    expect(latestMainNet?.id).toBe(1);
    expect(latestTestNet?.id).toBe(4);
  });
});

describe('findLatestStableRelease', () => {
  /**
   * Target:
   * It should find latest stable (that is, non-prerelease) release correctly
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
  it('should find latest stable release correctly', async () => {
    mockOctokit();

    const latestMainNet = await findLatestStableRelease('mainnet');
    const latestTestNet = await findLatestStableRelease('testnet');

    expect(latestMainNet?.id).toBe(2);
    expect(latestTestNet?.id).toBe(5);
  });
});
