import { isValidAssetName, truncateAssetName } from '../../lib/utils/rosen';

describe('isValidAssetName', () => {
  /**
   * @target
   * `isValidAssetName` should return `true` if an address file name matches a
   * chain type
   * @dependencies
   * @scenario
   * - get result by calling `isValidAssetName('mainnet')` with a mainnet
   *   address file name
   * @expected
   * - result should be true
   */
  it('should return `true` if an address file name matches a chain type', () => {
    const matchAssetName = 'contracts-awesomechain-mainnet-1.json';
    const isMatchingAssetName = isValidAssetName('mainnet')(matchAssetName);

    expect(isMatchingAssetName).toEqual(true);
  });

  /**
   * @target
   * `isValidAssetName` should return `false` if an address file name does not
   * match a chain type
   * @dependencies
   * @scenario
   * - get result by calling `isValidAssetName('mainnet')` with a testnet
   *   address file name
   * @expected
   * - result should be false
   */
  it('should return `false` if an address file name does not match a chain type', () => {
    const notMatchAssetName = 'contracts-awesomechain-testnet-1.json';
    const isMatchingAssetName = isValidAssetName('mainnet')(notMatchAssetName);

    expect(isMatchingAssetName).toEqual(false);
  });

  /**
   * @target
   * `isValidAssetName` should return `true` if a tokensMap file name matches a
   * chain type
   * @dependencies
   * @scenario
   * - get result by calling `isValidAssetName('mainnet')` with a mainnet
   *   tokensMap file name
   * @expected
   * - result should be true
   */
  it('should return `true` if a tokensMap file name matches a chain type', () => {
    const matchAssetName = 'tokensMap-mainnet-1.json';
    const isMatchingAssetName = isValidAssetName('mainnet')(matchAssetName);

    expect(isMatchingAssetName).toEqual(true);
  });

  /**
   * @target
   * `isValidAssetName` should return `false` if a tokensMap file name does not
   * match a chain type
   * @dependencies
   * @scenario
   * - get result by calling `isValidAssetName('mainnet')` with a testnet
   *   tokensMap file name
   * @expected
   * - result should be false
   */
  it('should return `false` if a tokensMap file name does not match a chain type', () => {
    const notMatchAssetName = 'tokensMap-testnet-1.json';
    const isMatchingAssetName = isValidAssetName('mainnet')(notMatchAssetName);

    expect(isMatchingAssetName).toEqual(false);
  });

  /**
   * @target
   * `isValidAssetName` should return false when asset name doesn't match Rosen
   * format assets
   * @dependencies
   * @scenario
   * - get result by calling `isValidAssetName('mainnet')` with an invalid asset
   *   file name
   * @expected
   * - result should be false
   */
  it("should return false when asset name doesn't match Rosen format assets", () => {
    const invalidAssetName = 'invalid-name.json';
    const isMatchingAssetName = isValidAssetName('mainnet')(invalidAssetName);

    expect(isMatchingAssetName).toEqual(false);
  });
});

describe('truncateAssetName', () => {
  /**
   * @target
   * `truncateAssetName` should truncate contract file names correctly
   * @dependencies
   * @scenario
   * - get result by calling `truncateAssetName` with a contract file name
   * @expected
   * - result should be truncated name
   */
  it('should truncate contract file names correctly', () => {
    const addressAssetName = 'contracts-awesomechain-mainnet-1.json';
    const truncatedName = truncateAssetName(addressAssetName);

    expect(truncatedName).toEqual('contracts-awesomechain.json');
  });

  /**
   * @target
   * `truncateAssetName` should truncate tokensMap file names correctly
   * @dependencies
   * @scenario
   * - get result by calling `truncateAssetName` with a tokensMap file name
   * @expected
   * - result should be truncated name
   */
  it('should truncate contract file names correctly', () => {
    const tokensMapAssetName = 'tokensMap-mainnet-1.json';
    const truncatedName = truncateAssetName(tokensMapAssetName);

    expect(truncatedName).toEqual('tokensMap.json');
  });

  /**
   * @target
   * `truncateAssetName` should truncate asset name and append suffix correctly
   * @dependencies
   * @scenario
   * - get result by calling `truncateAssetName` with an asset name
   * @expected
   * - result should be truncated name with suffix
   */
  it('should truncate asset name and append suffix correctly', () => {
    const assetName = 'contracts-awesomechain-mainnet-1.json';
    const truncatedNameWithSuffix = truncateAssetName(assetName, 'suffix');

    expect(truncatedNameWithSuffix).toEqual(
      'contracts-awesomechain-suffix.json'
    );
  });
});
