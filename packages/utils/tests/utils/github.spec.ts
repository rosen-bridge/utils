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
   * - The first iteration result should have a length of 5
   * - The second iteration result should have a length of 4
   * - The third iteration result should be undefined and its `done` property
   *   should be `true`
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
   * - The found release id should equal mainnet stable release id
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
   * - The found release id should equal the last release id
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
   * - The found release should be null
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
   * - Checking the existence of mainnet assets in a mainnet release should return
   *   true
   * - Checking the existence of mainnet assets in a testnet release should return
   *   false
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
   * - Checking if a release is stable release for mainnet chain type when provided
   *   a mainnet prerelease release should return false
   * - Checking if a release is stable release for mainnet chain type when provided
   *   a mainnet stable release should return true
   * - Checking if a release is stable release for testnet chain type when provided
   *   a testnet stable release should return false
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
   * - Found latest mainnet release id should equal mainnet prerelease release id
   * - Found latest testnet release id should equal testnet prerelease release id
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
   * - Found latest mainnet stable release id should equal mainnet stable release
   *   id
   * - Found latest testnet stable release id should equal testnet stable release
   *   id
   */
  it('should find latest stable release correctly', async () => {
    mockOctokit();

    const latestMainNet = await findLatestStableRelease('mainnet');
    const latestTestNet = await findLatestStableRelease('testnet');

    expect(latestMainNet?.id).toBe(mainNetStableRelease.id);
    expect(latestTestNet?.id).toBe(testNetStableRelease.id);
  });
});
