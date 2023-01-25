import TestUtils from './TestUtils';
import { getExplorerRosenData } from '../../../lib';
import { ERGO_NATIVE_TOKEN } from '../../../lib/getRosenData/const';

describe('getExplorerRosenData', () => {
  const bankSK =
    'f133100250abf1494e9ff5a0f998dc2fea7a5aa35641454ba723c913bff0e8fa';
  const watcherAddress = '9i1EZHaRPTLajwJivCFpdoi65r7A8ZgJxVbMtxZ23W5Z2gDkKdM';
  const watcherSK =
    '3870dab5e5fb3eebfdcb30031b65a8dbb8eec75ffe3558e7d0c7ef9529984ee1';

  /**
   * Target: getExplorerRosenData
   * Dependencies:
   *  -
   * Scenario:
   *  generate valid rosen data transferring token
   *  run test
   *  check return value
   * Expected:
   *  function returns rosenData object
   */
  it('should extract valid rosenData transferring token successfully', async () => {
    // generate valid rosen data transferring token
    const tx = TestUtils.observationTxGenerator(
      true,
      ['cardano', 'address', '10000', '1000', watcherAddress],
      bankSK,
      watcherSK
    );

    // run test
    const result = getExplorerRosenData(tx.outputs[0]);

    // check return value
    expect(result).toStrictEqual({
      toChain: 'cardano',
      toAddress: 'address',
      bridgeFee: '1000',
      networkFee: '10000',
      fromAddress: watcherAddress,
      amount: BigInt(10),
      tokenId:
        'f6a69529b12a7e2326acffee8383e0c44408f87a872886fadf410fe8498006d3',
    });
  });

  /**
   * Target: getExplorerRosenData
   * Dependencies:
   *  -
   * Scenario:
   *  generate valid rosen data transferring erg
   *  run test
   *  check return value
   * Expected:
   *  function returns rosenData object
   */
  it('should extract valid rosenData transferring erg successfully', async () => {
    // generate valid rosen data transferring erg
    const tx = TestUtils.observationTxGenerator(
      false,
      ['cardano', 'address', '10000', '1000', watcherAddress],
      bankSK,
      watcherSK,
      '100000000000'
    );

    // run test
    const result = getExplorerRosenData(tx.outputs[0]);

    // check return value
    expect(result).toStrictEqual({
      toChain: 'cardano',
      toAddress: 'address',
      bridgeFee: '1000',
      networkFee: '10000',
      fromAddress: watcherAddress,
      amount: BigInt('100000000000'),
      tokenId: ERGO_NATIVE_TOKEN,
    });
  });

  /**
   * Target: getExplorerRosenData
   * Dependencies:
   *  -
   * Scenario:
   *  generate invalid rosen data (invalid register value)
   *  run test
   *  check return value
   * Expected:
   *  function returns rosenData object
   */
  it('should return undefined when register value is invalid', async () => {
    // generate invalid rosen data (invalid register value)
    const tx = TestUtils.observationTxGenerator(
      true,
      ['Cardano', 'address', '10000'],
      bankSK,
      watcherSK
    );

    // run test
    const result = getExplorerRosenData(tx.outputs[0]);

    // check return value
    expect(result).toEqual(undefined);
  });
});
