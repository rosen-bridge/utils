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
   * @target `fetchReleasesPage` should generate releases correctly
   * @dependencies
   * - mocked Octokit
   * @scenario
   * - mock Octokit `listReleases` to return 9 releases
   * - create an iterator by calling `fetchReleasesPage` generator function
   * @expected
   * - The first iteration result should have a length of 5
   * - The second iteration result should have a length of 4
   * - The third iteration result should be undefined and its `done` property
   *   should be `true`
   */
  it('should generate releases correctly', async () => {
    mockOctokit();

    const iterator = fetchReleasesPage();

    expect((await iterator.next()).value?.length).toEqual(5);
    expect((await iterator.next()).value?.length).toEqual(4);
    expect((await iterator.next()).value).toEqual(undefined);
    expect((await iterator.next()).done).toEqual(true);
  });
});

describe('findLastRelease', () => {
  /**
   * @target `findLastRelease` should find last release correctly
   * @dependencies
   * - mocked Octokit
   * @scenario
   * - mock Octokit `listReleases` to return 9 releases
   * - call `findLastRelease` with a predicate
   * @expected
   * - The found release id should equal mainnet stable release id
   */
  it('should find last releases correctly when a predicate is provided', async () => {
    mockOctokit();

    const foundReleases = await findLastRelease(
      (release) => release.id === mainNetStableRelease.id
    );

    expect(foundReleases?.id).toEqual(mainNetStableRelease.id);
  });

  /**
   * @target `findLastRelease` should return last release when no predicate is
   * provided
   * @dependencies
   * - mocked Octokit
   * @scenario
   * - mock Octokit `listReleases` to return 9 releases
   * - call `findLastRelease` without a predicate
   * @expected
   * - The found release id should equal the last release id
   */
  it('should return last release when no predicate is provided', async () => {
    mockOctokit();

    const foundReleases = await findLastRelease();

    expect(foundReleases?.id).toEqual(releases[0].id);
  });

  /**
   * @target `findLastRelease` should return null when no matching release is
   * found
   * @dependencies
   * - mocked Octokit
   * @scenario
   * - mock Octokit `listReleases` to return 9 releases
   * - call `findLastRelease` with a predicate which does not match any release
   * @expected
   * - The found release should be null
   */
  it('should return null when no matching release is found', async () => {
    mockOctokit();

    const foundReleases = await findLastRelease(
      (release) => release.id === 100
    );

    expect(foundReleases).toEqual(null);
  });
});

describe('hasAssetForChainType', () => {
  /**
   * @target `hasAssetForChainType` should check if a release has some assets
   * for chain type correctly
   * @dependencies
   * @scenario
   * @expected
   * - Checking the existence of mainnet assets in a mainnet release should
   *   return true
   * - Checking the existence of mainnet assets in a testnet release should
   *   return false
   */
  it('should check if a release has some assets for chain type correctly', () => {
    expect(
      hasAssetForChainType('mainnet')(mainNetPrereleaseRelease as any)
    ).toEqual(true);
    expect(
      hasAssetForChainType('mainnet')(testNetPrereleaseRelease as any)
    ).toEqual(false);
  });
});

describe('isStableReleaseForChainType', () => {
  /**
   * @target `isStableReleaseForChainType` should check if a release is stable
   * (that is, non-prerelease) and has some assets for chain type correctly
   * @dependencies
   * @scenario
   * @expected
   * - Checking if a release is stable release for mainnet chain type when
   *   provided a mainnet prerelease release should return false
   * - Checking if a release is stable release for mainnet chain type when
   *   provided a mainnet stable release should return true
   * - Checking if a release is stable release for testnet chain type when
   *   provided a testnet stable release should return false
   */
  it('should check if a release is stable and has some assets for chain type correctly', () => {
    expect(
      isStableReleaseForChainType('mainnet')(mainNetPrereleaseRelease as any)
    ).toEqual(false);
    expect(
      isStableReleaseForChainType('mainnet')(mainNetStableRelease as any)
    ).toEqual(true);
    expect(
      isStableReleaseForChainType('mainnet')(testNetStableRelease as any)
    ).toEqual(false);
  });
});

describe('findLatestRelease', () => {
  /**
   * @target `findLatestRelease` should find latest release correctly
   * @dependencies
   * - mocked Octokit
   * @scenario
   * - mock Octokit `listReleases` to return 9 releases
   * - call `findLatestRelease` to find latest mainnet release
   * - call `findLatestRelease` to find latest testnet release
   * @expected
   * - Found latest mainnet release id should equal mainnet prerelease release
   *   id
   * - Found latest testnet release id should equal testnet prerelease release
   *   id
   */
  it('should find latest release correctly', async () => {
    mockOctokit();

    const latestMainNet = await findLatestRelease('mainnet');
    const latestTestNet = await findLatestRelease('testnet');

    expect(latestMainNet?.id).toEqual(mainNetPrereleaseRelease.id);
    expect(latestTestNet?.id).toEqual(testNetPrereleaseRelease.id);
  });
});

describe('findLatestStableRelease', () => {
  /**
   * @target `findLatestStableRelease` should find latest stable (that is,
   * non-prerelease) release correctly
   * @dependencies
   * - mocked Octokit
   * @scenario
   * - mock Octokit `listReleases` to return 9 releases
   * - call `findLatestStableRelease` to find latest stable mainnet release
   * - call `findLatestStableRelease` to find latest stable testnet release
   * @expected
   * - Found latest mainnet stable release id should equal mainnet stable
   *   release id
   * - Found latest testnet stable release id should equal testnet stable
   *   release id
   */
  it('should find latest stable release correctly', async () => {
    mockOctokit();

    const latestMainNet = await findLatestStableRelease('mainnet');
    const latestTestNet = await findLatestStableRelease('testnet');

    expect(latestMainNet?.id).toEqual(mainNetStableRelease.id);
    expect(latestTestNet?.id).toEqual(testNetStableRelease.id);
  });
});
