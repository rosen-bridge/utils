import { isValidAssetName, truncateAssetName } from '../../lib/utils/rosen';

describe('assetNameMatchesChainType', () => {
  /**
   * Target:
   * It should check if asset name matches chain type correctly for address assets
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
  it('should check if asset name matches chain type correctly for address assets', () => {
    const matchAssetName = 'contracts-awesomechain-mainnet-1.json';
    const notMatchAssetName = 'contracts-awesomechain-testnet-1.json';

    expect(isValidAssetName('mainnet')(matchAssetName)).toBe(true);
    expect(isValidAssetName('mainnet')(notMatchAssetName)).toBe(false);
  });

  /**
   * Target:
   * It should check if asset name matches chain type correctly for tokensMap asset
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
  it('should check if asset name matches chain type correctly for tokensMap asset', () => {
    const matchAssetName = 'tokensMap-mainnet-1.json';
    const notMatchAssetName = 'tokensMap-testnet-1.json';

    expect(isValidAssetName('mainnet')(matchAssetName)).toBe(true);
    expect(isValidAssetName('mainnet')(notMatchAssetName)).toBe(false);
  });

  /**
   * Target:
   * It should return false if asset name doesn't match Rosen format assets
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
  it("should return false if asset name doesn't match Rosen format assets", () => {
    const invalidAssetName = 'invalid-name.json';

    expect(isValidAssetName('mainnet')(invalidAssetName)).toBe(false);
  });
});

describe('truncateAssetName', () => {
  /**
   * Target:
   * It should truncate asset name correctly
   *
   * Dependencies:
   * N/A
   *
   * Scenario:
   * N/A
   *
   * Expected output:
   * A truncated asset name
   */
  it('should truncate asset name correctly', () => {
    const addressAssetName = 'contracts-awesomechain-mainnet-1.json';
    const tokensMapAssetName = 'tokensMap-mainnet-1.json';

    expect(truncateAssetName(addressAssetName)).toBe(
      'contracts-awesomechain.json'
    );
    expect(truncateAssetName(tokensMapAssetName)).toBe('tokensMap.json');
  });

  /**
   * Target:
   * It should truncate asset name and append suffix correctly
   *
   * Dependencies:
   * N/A
   *
   * Scenario:
   * N/A
   *
   * Expected output:
   * A truncated asset name with a suffix appended to the name
   */
  it('should truncate asset name and append suffix correctly', () => {
    const assetName = 'contracts-awesomechain-mainnet-1.json';

    expect(truncateAssetName(assetName, 'suffix')).toBe(
      'contracts-awesomechain-suffix.json'
    );
  });
});
