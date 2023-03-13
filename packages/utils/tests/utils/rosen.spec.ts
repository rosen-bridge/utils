import { isValidAssetName, truncateAssetName } from '../../lib/utils/rosen';

describe('isValidAssetName', () => {
  /**
   * @target
   * `isValidAssetName` should check if asset name matches chain type correctly
   * for address assets
   * @dependencies
   * @scenario
   * @expected
   * - Checking if an address file containing "mainnet" is a valid mainnet asset
   *   name should return true
   * - Checking if an address file not containing "mainnet" is a valid mainnet
   *   asset name should return false
   */
  it('should check if asset name matches chain type correctly for address assets', () => {
    const matchAssetName = 'contracts-awesomechain-mainnet-1.json';
    const notMatchAssetName = 'contracts-awesomechain-testnet-1.json';

    expect(isValidAssetName('mainnet')(matchAssetName)).toEqual(true);
    expect(isValidAssetName('mainnet')(notMatchAssetName)).toEqual(false);
  });

  /**
   * @target
   * `isValidAssetName` should check if asset name matches chain type correctly
   * for tokensMap asset
   * @dependencies
   * @scenario
   * @expected
   * - Checking if a tokensMap file containing "mainnet" is a valid mainnet
   *   asset name should return false
   * - Checking if a tokensMap file not containing "mainnet" is a valid mainnet
   *   asset name should return false
   */
  it('should check if asset name matches chain type correctly for tokensMap asset', () => {
    const matchAssetName = 'tokensMap-mainnet-1.json';
    const notMatchAssetName = 'tokensMap-testnet-1.json';

    expect(isValidAssetName('mainnet')(matchAssetName)).toEqual(true);
    expect(isValidAssetName('mainnet')(notMatchAssetName)).toEqual(false);
  });

  /**
   * @target
   * `isValidAssetName` should return false when asset name doesn't match Rosen
   * format assets
   * @dependencies
   * @scenario
   * @expected
   * - Checking if a file with wrong rosen file name format is a valid mainnet
   *   asset name should return false
   */
  it("should return false when asset name doesn't match Rosen format assets", () => {
    const invalidAssetName = 'invalid-name.json';

    expect(isValidAssetName('mainnet')(invalidAssetName)).toEqual(false);
  });
});

describe('truncateAssetName', () => {
  /**
   * @target
   * `truncateAssetName` should truncate asset name correctly
   * @dependencies
   * @scenario
   * @expected
   * - A truncated address file name should return the same name without chain
   *   type and tag name
   * - A truncated tokensMap file name should return the same name without chain
   *   type and tag name
   */
  it('should truncate asset name correctly', () => {
    const addressAssetName = 'contracts-awesomechain-mainnet-1.json';
    const tokensMapAssetName = 'tokensMap-mainnet-1.json';

    expect(truncateAssetName(addressAssetName)).toEqual(
      'contracts-awesomechain.json'
    );
    expect(truncateAssetName(tokensMapAssetName)).toEqual('tokensMap.json');
  });

  /**
   * @target
   * `truncateAssetName` should truncate asset name and append suffix correctly
   * @dependencies
   * @scenario
   * @expected
   * - A truncated asset file name should return the same name without chain
   *   type and tag name, but with the suffix provided
   */
  it('should truncate asset name and append suffix correctly', () => {
    const assetName = 'contracts-awesomechain-mainnet-1.json';

    expect(truncateAssetName(assetName, 'suffix')).toEqual(
      'contracts-awesomechain-suffix.json'
    );
  });
});
