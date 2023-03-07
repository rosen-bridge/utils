import { Octokit } from 'octokit';

import {
  fetchReleasesPage,
  findLatestRelease,
  hasAssetForChainType,
  findLastRelease,
  isStableReleaseForChainType,
  findLatestStableRelease,
} from '../../lib/utils/github';

import {
  mainNetPrereleaseRelease,
  mainNetStableRelease,
  releases,
  testNetPrereleaseRelease,
  testNetStableRelease,
} from '../data/octokit.data';

import { mockOctokit } from '../mocks/octokit.mock';

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

    const foundReleases = await findLastRelease(
      (release) => release.id === mainNetStableRelease.id
    );

    expect(foundReleases?.id).toBe(mainNetStableRelease.id);
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

    expect(foundReleases?.id).toBe(releases[0].id);
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
    expect(
      hasAssetForChainType('mainnet')(mainNetPrereleaseRelease as any)
    ).toBe(true);
    expect(
      hasAssetForChainType('mainnet')(testNetPrereleaseRelease as any)
    ).toBe(false);
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
    expect(
      isStableReleaseForChainType('mainnet')(mainNetPrereleaseRelease as any)
    ).toBe(false);
    expect(
      isStableReleaseForChainType('mainnet')(mainNetStableRelease as any)
    ).toBe(true);
    expect(
      isStableReleaseForChainType('mainnet')(testNetStableRelease as any)
    ).toBe(false);
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

    expect(latestMainNet?.id).toBe(mainNetPrereleaseRelease.id);
    expect(latestTestNet?.id).toBe(testNetPrereleaseRelease.id);
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

    expect(latestMainNet?.id).toBe(mainNetStableRelease.id);
    expect(latestTestNet?.id).toBe(testNetStableRelease.id);
  });
});
