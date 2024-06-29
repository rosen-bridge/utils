import {
  fetchReleasesPage,
  findLatestRelease,
  hasAssetForChainType,
  findLastRelease,
  isStableReleaseForChainType,
  isStableReleaseForRegexTagType,
  findLatestStableRelease,
  getReleaseByTag,
  hasMatchedTagPrefix,
  findLatestStableReleaseByPrefixTag,
  findLatestReleaseByPrefixTag,
} from '../../lib/utils/github';

import {
  mainNetPrereleaseRelease,
  mainNetStableRelease,
  contractReleases,
  testNetPrereleaseRelease,
  testNetStableRelease,
  tssTag2,
  tssTag3PreRelease,
  tssTag1,
  tssReleases,
} from '../data/octokit.data';

import { mockOctokit, mockOctokitGetReleaseByTag } from '../mocks/octokit.mock';

describe('fetchReleasesPage', () => {
  /**
   * @target `fetchReleasesPage` should generate contractReleases correctly
   * @dependencies
   * - mocked Octokit
   * @scenario
   * - mock Octokit `listReleases` to return 9 contractReleases
   * - create an iterator by calling `fetchReleasesPage` generator function
   * - get results by consuming iterator
   * @expected
   * - first result value should have length of 5
   * - second result value should have length of 4
   * - third result value should be undefined
   * - third result done property should be true
   */
  it('should generate releases correctly', async () => {
    mockOctokit(contractReleases);

    const iterator = fetchReleasesPage('contract');

    expect((await iterator.next()).value).toHaveLength(5);
    expect((await iterator.next()).value).toHaveLength(4);
    expect((await iterator.next()).value).toEqual(undefined);
    expect((await iterator.next()).done).toEqual(true);
  });
});

describe('findLastRelease', () => {
  beforeEach(() => {
    mockOctokit(contractReleases);
  });

  /**
   * @target `findLastRelease` should find last release correctly
   * @dependencies
   * - mocked Octokit
   * @scenario
   * - mock Octokit `listReleases` to return 9 contractReleases
   * - get result by calling `findLastRelease` with a predicate
   * @expected
   * - result id should equal mainnet stable release id
   */
  it('should find last release correctly when a predicate is provided', async () => {
    const foundRelease = await findLastRelease(
      'contract',
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
   * - mock Octokit `listReleases` to return 9 contractReleases
   * - get result by calling `findLastRelease` without a predicate
   * @expected
   * - result id should equal the last release id
   */
  it('should return last release when no predicate is provided', async () => {
    const foundRelease = await findLastRelease('contract');

    expect(foundRelease?.id).toEqual(contractReleases[0].id);
  });

  /**
   * @target `findLastRelease` should return null when no matching release is
   * found
   * @dependencies
   * - mocked Octokit
   * @scenario
   * - mock Octokit `listReleases` to return 9 contractReleases
   * - get result by calling `findLastRelease` with a predicate which does not
   *   match any release
   * @expected
   * - result should be null
   */
  it('should return null when no matching release is found', async () => {
    const foundRelease = await findLastRelease(
      'contract',
      (release) => release.id === 100
    );

    expect(foundRelease).toEqual(null);
  });
});

describe('getReleaseByTag', () => {
  /**
   * @target `getReleaseByTag` should get release by tag
   * @dependencies
   * - mocked `getReleaseByTag` of Octokit
   * @scenario
   * - call the function
   * @expected
   * - the release should be the expected one
   */
  it('should get release by tag', async () => {
    mockOctokitGetReleaseByTag(contractReleases);

    const release = await getReleaseByTag('contract', '3');

    expect(release.id).toEqual(3);
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

describe('hasMatchedTagPrefix', () => {
  /**
   * @target `hasMatchedTagPrefix` should return `true` if a release
   * has asset using a prefix tag
   * @dependencies
   * @scenario
   * - get a result by calling `hasMatchedTagPrefix('tss-api-')` with a
   *   tss-api prerelease release
   * @expected
   * - result should be true
   */
  it('should return `true` if a release has asset using a prefix tag', () => {
    const isMatchingRelease = hasMatchedTagPrefix('tss-api-')(
      tssTag3PreRelease as any
    );

    expect(isMatchingRelease).toEqual(true);
  });

  /**
   * @target `hasMatchedTagPrefix` should return `false`,
   *  if doesn't exist matched tag prefix
   * @dependencies
   * @scenario
   * - get result by calling `hasMatchedTagPrefix('no-tag')` with a
   *   tss-api stable release
   * @expected
   * - result should be false
   */
  it("should return `false` if doesn't exist matched tag prefix", () => {
    const isMatchingRelease = hasMatchedTagPrefix('no-tag')(tssTag1 as any);

    expect(isMatchingRelease).toEqual(false);
  });
});

describe('isStableReleaseForRegexTagType', () => {
  /**
   * @target `isStableReleaseForRegexTagType` should return `true` if a release
   * is stable and has asset using a prefix tag
   * @dependencies
   * @scenario
   * - get result by calling `isStableReleaseForRegexTagType('tss-api-')` with a
   *   tss-api stable release
   * @expected
   * - result should be true
   */
  it('should return `true` if a release is stable and has asset using a prefix tag', () => {
    const isMatchingRelease = isStableReleaseForRegexTagType('tss-api-')(
      tssTag2 as any
    );

    expect(isMatchingRelease).toEqual(true);
  });

  /**
   * @target `isStableReleaseForRegexTagType` should return `false` if a release
   * has asset for a prefix tag but is prerelease
   * @dependencies
   * @scenario
   * - get result by calling `isStableReleaseForRegexTagType('tss-api')` with a
   *   tss-api prerelease release
   * @expected
   * - result should be false
   */
  it('should return `false` if a release has asset for a prefix tag but is prerelease', () => {
    const isMatchingRelease = isStableReleaseForRegexTagType('tss-api')(
      tssTag3PreRelease as any
    );

    expect(isMatchingRelease).toEqual(false);
  });

  /**
   * @target `isStableReleaseForRegexTagType` should return `false` if a release is
   * stable but does not have a release with prefix tag
   * @dependencies
   * @scenario
   * - get result by calling `isStableReleaseForRegexTagType('no-tag')` with a
   *   tss stable release tag
   * @expected
   * - result should be false
   */
  it('should return `false` if a release is stable but does not have prefix tag', () => {
    const isMatchingRelease = isStableReleaseForRegexTagType('no-tag')(
      tssTag1 as any
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
   * - mock Octokit `listReleases` to return 9 contractReleases
   * - get result by calling `findLatestRelease` with mainnet chain type
   * @expected
   * - result id should equal mainnet prerelease release id
   */
  it('should find latest release for a chain type correctly', async () => {
    mockOctokit(contractReleases);

    const latestMainNet = await findLatestRelease('contract', 'mainnet');

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
   * - mock Octokit `listReleases` to return 9 contractReleases
   * - get result by calling `findLatestStableRelease` with mainnet chain type
   * @expected
   * - result id should equal mainnet stable release id
   */
  it('should find latest stable (that is, non-prerelease) release for a chain type correctly', async () => {
    mockOctokit(contractReleases);

    const latestMainNet = await findLatestStableRelease('contract', 'mainnet');

    expect(latestMainNet?.id).toEqual(mainNetStableRelease.id);
  });
});

describe('findLatestReleaseByPrefixTag', () => {
  /**
   * @target `findLatestReleaseByPrefixTag` should find latest release with
   * a prefix tag correctly
   * @dependencies
   * - mocked Octokit
   * @scenario
   * - mock Octokit `listReleases` to return tssReleases
   * - get result by calling `findLatestReleaseByPrefixTag` with tss-api prefix tag
   * @expected
   * - result id should equal tssTag3PreRelease release id
   */
  it('should find latest release for tss-api prefix tag correctly', async () => {
    mockOctokit(tssReleases);

    const latestTss = await findLatestReleaseByPrefixTag(
      'sign-protocols',
      'tss-api'
    );

    expect(latestTss?.id).toEqual(tssTag3PreRelease.id);
  });
});

describe('findLatestStableReleaseByPrefixTag', () => {
  /**
   * @target `findLatestStableReleaseByPrefixTag` should find latest stable (that is,
   * non-prerelease) release with a prefix tag
   * @dependencies
   * - mocked Octokit
   * @scenario
   * - mock Octokit `listReleases` to return tssReleases
   * - get result by calling `findLatestStableReleaseByPrefixTag` with tss-api prefix tag
   * @expected
   * - result id should equal tssTag2 stable release id
   */
  it('should find latest stable (that is, non-prerelease) release for tss-api prefix tag correctly', async () => {
    mockOctokit(tssReleases);

    const latestTss = await findLatestStableReleaseByPrefixTag(
      'sign-protocols',
      'tss-api'
    );

    expect(latestTss?.id).toEqual(tssTag2.id);
  });
});
