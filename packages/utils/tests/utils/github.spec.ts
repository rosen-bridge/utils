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
   * - get results by consuming iterator
   * @expected
   * - first result value should have length of 5
   * - second result value should have length of 4
   * - third result value should be undefined
   * - third result done property should be true
   */
  it('should generate releases correctly', async () => {
    mockOctokit();

    const iterator = fetchReleasesPage();

    expect((await iterator.next()).value).toHaveLength(5);
    expect((await iterator.next()).value).toHaveLength(4);
    expect((await iterator.next()).value).toEqual(undefined);
    expect((await iterator.next()).done).toEqual(true);
  });
});

describe('findLastRelease', () => {
  beforeEach(() => {
    mockOctokit();
  });

  /**
   * @target `findLastRelease` should find last release correctly
   * @dependencies
   * - mocked Octokit
   * @scenario
   * - mock Octokit `listReleases` to return 9 releases
   * - get result by calling `findLastRelease` with a predicate
   * @expected
   * - result id should equal mainnet stable release id
   */
  it('should find last releases correctly when a predicate is provided', async () => {
    const foundRelease = await findLastRelease(
      (release) => release.id === mainNetStableRelease.id
    );

    expect(foundRelease?.id).toEqual(mainNetStableRelease.id);
  });

  /**
   * @target `findLastRelease` should return last release when no predicate is
   * provided
   * @dependencies
   * - mocked Octokit
   * @scenario
   * - mock Octokit `listReleases` to return 9 releases
   * - get result by calling `findLastRelease` without a predicate
   * @expected
   * - result id should equal the last release id
   */
  it('should return last release when no predicate is provided', async () => {
    const foundRelease = await findLastRelease();

    expect(foundRelease?.id).toEqual(releases[0].id);
  });

  /**
   * @target `findLastRelease` should return null when no matching release is
   * found
   * @dependencies
   * - mocked Octokit
   * @scenario
   * - mock Octokit `listReleases` to return 9 releases
   * - get result by calling `findLastRelease` with a predicate which does not
   *   match any release
   * @expected
   * - result should be null
   */
  it('should return null when no matching release is found', async () => {
    const foundRelease = await findLastRelease((release) => release.id === 100);

    expect(foundRelease).toEqual(null);
  });
});

describe('hasAssetForChainType', () => {
  /**
   * @target `hasAssetForChainType` should return `true` if a release has asset
   * for a specific chain type
   * @dependencies
   * @scenario
   * - get result by calling `hasAssetForChainType('mainnet')` with a mainnet
   *   release
   * @expected
   * - result should be true
   */
  it('should return `true` if a release has asset for a specific chain type', () => {
    const hasAssetForMainNet = hasAssetForChainType('mainnet')(
      mainNetPrereleaseRelease as any
    );

    expect(hasAssetForMainNet).toEqual(true);
  });
  /**
   * @target `hasAssetForChainType` should return `false` if a release does not
   * have asset for a specific chain type
   * @dependencies
   * @scenario
   * - get result by calling `hasAssetForChainType('mainnet')` with a mainnet
   *   release
   * @expected
   * - result should be false
   */
  it('should return `false` if a release does not have asset for a specific chain type', () => {
    const hasAssetForMainNet = hasAssetForChainType('mainnet')(
      testNetPrereleaseRelease as any
    );

    expect(hasAssetForMainNet).toEqual(false);
  });
});

describe('isStableReleaseForChainType', () => {
  /**
   * @target `isStableReleaseForChainType`
   * @dependencies
   * @scenario
   * - get result by calling `isStableReleaseForChainType('mainnet')` with a
   *   mainnet stable release
   * @expected
   * - result should be true
   */
  it('should return `true` if a release is stable (that is, non-prerelease) and has asset for a specific chain type', () => {
    const isMatchingRelease = isStableReleaseForChainType('mainnet')(
      mainNetStableRelease as any
    );

    expect(isMatchingRelease).toEqual(true);
  });
  /**
   * @target `isStableReleaseForChainType` should return `false` if a release
   * has asset for a specific chain type but is prerelease
   * @dependencies
   * @scenario
   * - get result by calling `isStableReleaseForChainType('mainnet')` with a
   *   mainnet prerelease release
   * @expected
   * - result should be false
   */
  it('should return `false` if a release has asset for a specific chain type but is prerelease', () => {
    const isMatchingRelease = isStableReleaseForChainType('mainnet')(
      mainNetPrereleaseRelease as any
    );

    expect(isMatchingRelease).toEqual(false);
  });
  /**
   * @target `isStableReleaseForChainType` should return `false` if a release is
   * stable (that is, non-prerelease) but does not have asset for a specific
   * chain type
   * @dependencies
   * @scenario
   * - get result by calling `isStableReleaseForChainType('mainnet')` with a
   *   testnet stable release
   * @expected
   * - result should be false
   */
  it('should return `false` if a release is stable (that is, non-prerelease) but does not have asset for a specific chain type', () => {
    const isMatchingRelease = isStableReleaseForChainType('mainnet')(
      testNetStableRelease as any
    );

    expect(isMatchingRelease).toEqual(false);
  });
});

describe('findLatestRelease', () => {
  /**
   * @target `findLatestRelease` should find latest release for a chain type
   * correctly
   * @dependencies
   * - mocked Octokit
   * @scenario
   * - mock Octokit `listReleases` to return 9 releases
   * - get result by calling `findLatestRelease` with mainnet chain type
   * @expected
   * - result id should equal mainnet prerelease release id
   */
  it('should find latest release for a chain type correctly', async () => {
    mockOctokit();

    const latestMainNet = await findLatestRelease('mainnet');

    expect(latestMainNet?.id).toEqual(mainNetPrereleaseRelease.id);
  });
});

describe('findLatestStableRelease', () => {
  /**
   * @target `findLatestStableRelease` should find latest stable (that is,
   * non-prerelease) release for a chain type correctly
   * @dependencies
   * - mocked Octokit
   * @scenario
   * - mock Octokit `listReleases` to return 9 releases
   * - get result by calling `findLatestStableRelease` with mainnet chain type
   * @expected
   * - result id should equal mainnet stable release id
   */
  it('should find latest stable (that is, non-prerelease) release for a chain type correctly', async () => {
    mockOctokit();

    const latestMainNet = await findLatestStableRelease('mainnet');

    expect(latestMainNet?.id).toEqual(mainNetStableRelease.id);
  });
});
