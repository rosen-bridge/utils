import { getKoiosRosenData } from '../../../lib';
import TestUtils from './TestUtils';

describe('getKoiosRosenData', () => {
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
    const metadata = TestUtils.ValidMetaData;

    // run test
    const result = getKoiosRosenData(metadata);

    // check return value
    expect(result).toStrictEqual(TestUtils.ValidMetaDataResult);
  });

  /**
   * Target: getKoiosRosenData
   * Dependencies:
   *  -
   * Scenario:
   *  generate invalid rosen data (missing fromAddress key)
   *  run test
   *  check return value
   * Expected:
   *  function returns undefined
   */
  it.each(['to', 'bridgeFee', 'networkFee', 'toAddress', 'fromAddress'])(
    'should return undefined when metadata missing %p',
    (key) => {
      // generate invalid rosen data (missing key)
      const metadata = JSON.parse(
        JSON.stringify(TestUtils.ValidMetaData).replace(key, key + 'Fake')
      );

      // run test
      const result = getKoiosRosenData(metadata);

      // check return value
      expect(result).toBeUndefined();
    }
  );
});
