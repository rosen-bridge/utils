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
   * `fetchReleasesPage` should generate releases correctly
   *
   * Dependencies:
   * - mocked Octokit
   *
   * Scenario:
   * - mock Octokit `listReleases` to return 9 releases
   * - create an iterator by calling `fetchReleasesPage` generator function
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

describe('findLastRelease', () => {
  /**
   * Target:
   * `findLastRelease` should find last release correctly
   *
   * Dependencies:
   * - mocked Octokit
   *
   * Scenario:
   * - mock Octokit `listReleases` to return 9 releases
   * - call `findLastRelease` with a predicate
   *
   * Expected output:
   * The function should return correct release
   */
  it('should find last releases correctly when a predicate is provided', async () => {
    mockOctokit();

    const foundReleases = await findLastRelease(
      (release) => release.id === mainNetStableRelease.id
    );

    expect(foundReleases?.id).toBe(mainNetStableRelease.id);
  });

  /**
   * Target:
   * `findLastRelease` should return last release if no predicate is provided
   *
   * Dependencies:
   * - mocked Octokit
   *
   * Scenario:
   * - mock Octokit `listReleases` to return 9 releases
   * - call `findLastRelease` without a predicate
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
   * `findLastRelease` should return null if no matching release is found
   *
   * Dependencies:
   * - mocked Octokit
   *
   * Scenario:
   * - mock Octokit `listReleases` to return 9 releases
   * - call `findLastRelease` with a predicate which does not match any release
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
   * `hasAssetForChainType` should check if a release has some assets for chain
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
   * `isStableReleaseForChainType` should check if a release is stable (that is,
   * non-prerelease) and has some assets for chain type correctly
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
   * `findLatestRelease` should find latest release correctly
   *
   * Dependencies:
   * - mocked Octokit
   *
   * Scenario:
   * - mock Octokit `listReleases` to return 9 releases
   * - call `findLatestRelease` to find latest mainnet release
   * - call `findLatestRelease` to find latest testnet release
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
   * `findLatestStableRelease` should find latest stable (that is, non-prerelease)
   * release correctly
   *
   * Dependencies:
   * - mocked Octokit
   *
   * Scenario:
   * - mock Octokit `listReleases` to return 9 releases
   * - call `findLatestStableRelease` to find latest stable mainnet release
   * - call `findLatestStableRelease` to find latest stable testnet release
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
