import { getKoiosRosenData } from '../../../lib';

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
  it('should extract valid rosenData successfully', async () => {
    // generate valid rosen data
    const metadata = {
      '0': JSON.parse(
        '{' +
          '"to": "ergo",' +
          '"bridgeFee": "10000",' +
          '"networkFee": "1000",' +
          '"toAddress": "ergoAddress",' +
          '"fromAddress": ["hash"]' +
          '}'
      ),
    };

    // run test
    const result = getKoiosRosenData(metadata);

    // check return value
    expect(result).toStrictEqual({
      toChain: 'ergo',
      bridgeFee: '10000',
      networkFee: '1000',
      toAddress: 'ergoAddress',
      fromAddress: 'hash',
    });
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
  it('should return undefined when a required key missing', async () => {
    // generate valid rosen data
    const metadata = {
      '0': JSON.parse(
        '{' +
          '"to": "ergo",' +
          '"bridgeFee": "10000",' +
          '"networkFee": "1000",' +
          '"toAddress": "ergoAddress",' +
          '"targetChainTokenId": "cardanoTokenId"' +
          '}'
      ),
    };

    // run test
    const result = getKoiosRosenData(metadata);

    // check return value
    expect(result).toEqual(undefined);
  });
});
