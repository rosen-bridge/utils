import { parseAggregatedData } from '../../../lib/getRosenData/bitcoin-runes/utils';
import * as testData from './testData';

describe('parseAggregatedData', () => {
  /**
   * @target `parseAggregatedData` should extract rosen data successfully
   * @dependencies
   * @scenario
   * - mock utxo with scriptPubKey that contains valid rosen data
   * - run test
   * - check returned value
   * @expected
   * - it should return expected asset transformation
   */
  it('should extract rosen data successfully', () => {
    const script = testData.opReturnScripts.valid;
    const result = parseAggregatedData(script);

    expect(result).toStrictEqual(testData.opReturnData);
  });

  /**
   * @target `parseAggregatedData` should throw error
   * when toChain is invalid
   * @dependencies
   * @scenario
   * - mock utxo with scriptPubKey that contain rosen data with invalid toChain
   * - run test & check thrown exception
   * @expected
   * - it should throw error
   */
  it('should throw error when toChain is invalid', () => {
    const script = testData.opReturnScripts.invalidToChain;

    expect(() => {
      parseAggregatedData(script);
    }).toThrow(Error);
  });
});
