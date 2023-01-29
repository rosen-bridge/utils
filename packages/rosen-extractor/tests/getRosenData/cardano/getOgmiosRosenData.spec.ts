import { getOgmiosRosenData } from '../../../lib';
import TestUtils from './TestUtils';

describe('getOgmiosRosenData', () => {
  /**
   * Target: getKoiosRosenData
   * Dependencies:
   *  -
   * Scenario:
   *  generate valid rosen data
   *  run test
   *  check return value
   * Expected:
   *  function returns rosenData object
   */
  it('should extract valid rosenData successfully', () => {
    // generate valid rosen data
    const metadata = TestUtils.AuxiliaryData.validEvent;

    // run test
    const result = getOgmiosRosenData(metadata);

    // check return value
    expect(result).toEqual({
      bridgeFee: '3000',
      fromAddress:
        '7bb715ce7d410747beb98cb6fb322a5865894018433eb115d67625c5befb6f61',
      networkFee: '300',
      toAddress: '9hZxV3YNSfbCqS6GEses7DhAVSatvaoNtdsiNvkimPGG2c8fzkG',
      toChain: 'ergo',
    });
  });

  /**
   * Target: getKoiosRosenData
   * Dependencies:
   *  -
   * Scenario:
   *  generate invalid rosen data (no blob in metadata)
   *  run test
   *  check return value
   * Expected:
   *  function returns undefined
   */
  it('should return undefined when metadata has no blob', () => {
    // generate invalid rosen data (no blob in metadata)
    const metadata = TestUtils.AuxiliaryData.noBlob;

    // run test
    const result = getOgmiosRosenData(metadata);

    // check return value
    expect(result).toBeUndefined();
  });

  /**
   * Target: getKoiosRosenData
   * Dependencies:
   *  -
   * Scenario:
   *  generate invalid rosen data (invalid blob)
   *  run test
   *  check return value
   * Expected:
   *  function returns undefined
   */
  it("should return undefined when metadata blob missing '0' key", () => {
    // generate invalid rosen data (invalid blob)
    const metadata = TestUtils.AuxiliaryData.noBlobZeroKey;

    // run test
    const result = getOgmiosRosenData(metadata);

    // check return value
    expect(result).toBeUndefined();
  });

  /**
   * Target: getKoiosRosenData
   * Dependencies:
   *  -
   * Scenario:
   *  generate invalid rosen data (invalid key)
   *  run test
   *  check return value
   * Expected:
   *  function returns undefined
   */
  it.each(['to', 'bridgeFee', 'networkFee', 'toAddress', 'fromAddress'])(
    'should return undefined when rosenData missing %p',
    (key) => {
      // generate invalid rosen data (invalid key)
      const metadata = JSON.parse(
        JSON.stringify(TestUtils.AuxiliaryData.validEvent).replace(
          key,
          key + 'Fake'
        )
      );

      // run test
      const result = getOgmiosRosenData(metadata);

      // check return value
      expect(result).toBeUndefined();
    }
  );

  /**
   * Target: getKoiosRosenData
   * Dependencies:
   *  -
   * Scenario:
   *  generate invalid rosen data (invalid type)
   *  run test
   *  check return value
   * Expected:
   *  function returns undefined
   */
  it('should return undefined when rosenData contains invalid type for a required key', () => {
    // generate invalid rosen data (invalid type)
    const metadata = TestUtils.AuxiliaryData.invalidType;

    // run test
    const result = getOgmiosRosenData(metadata);

    // check return value
    expect(result).toBeUndefined();
  });

  /**
   * Target: getKoiosRosenData
   * Dependencies:
   *  -
   * Scenario:
   *  generate invalid rosen data (no json metadata)
   *  run test
   *  check return value
   * Expected:
   *  function returns undefined
   */
  it('should return undefined when metadata is not json', () => {
    // generate invalid rosen data (no json metadata)
    const metadata = TestUtils.AuxiliaryData.noJson;

    // run test
    const result = getOgmiosRosenData(metadata);

    // check return value
    expect(result).toBeUndefined();
  });
});
