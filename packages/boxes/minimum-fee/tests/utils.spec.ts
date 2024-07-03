import { ErgoBox } from 'ergo-lib-wasm-nodejs';
import { extractFeeFromBox, feeToRegisterValues } from '../lib';
import * as testData from './testData';

describe('extractFeeFromBox', () => {
  /**
   * @target extractFeeFromBox should build expected
   * config box with normal config for Erg successfully
   * @dependencies
   * @scenario
   * - mock test data
   * - run test
   * - check returned value
   * @expected
   * - it should return correct fee config
   */
  it('should build expected config box with normal config for Erg successfully', () => {
    const box = ErgoBox.from_json(testData.normalFeeBox);
    const result = extractFeeFromBox(box);
    expect(result).toEqual(testData.normalFee);
  });
});

describe('feeToRegisterValues', () => {
  /**
   * @target feeToRegisterValues should convert fee config to register values successfully
   * @dependencies
   * @scenario
   * - mock test data
   * - run test
   * - check returned value
   * @expected
   * - it should return correct register values
   */
  it('should convert fee config to register values successfully', () => {
    const fees = testData.normalFee;
    const result = feeToRegisterValues(fees);
    const expectedChains = ['binance', 'cardano', 'ergo'];
    expect(
      result.R4.to_coll_coll_byte().map((element) =>
        Buffer.from(element).toString()
      )
    ).toEqual(expectedChains);
    const expectedHeights = [
      [666, 444444, 11111],
      [777, 555555, 22222],
    ];
    expect(result.R5?.to_js()).toEqual(expectedHeights);
    const expectedBridgeFees = [
      ['700', '400', '100'],
      ['800', '500', '200'],
    ];
    expect(result.R6?.to_js()).toEqual(expectedBridgeFees);
    const expectedNetworkFees = [
      ['93', '70', '30'],
      ['96', '80', '40'],
    ];
    expect(result.R7?.to_js()).toEqual(expectedNetworkFees);
    const expectedRsnRatios = [
      [
        ['30', '3000'],
        ['20', '2000'],
        ['10', '1000'],
      ],
      [
        ['31', '3100'],
        ['21', '2100'],
        ['11', '1100'],
      ],
    ];
    expect(result.R8?.to_js()).toEqual(expectedRsnRatios);
    const expectedFeeRatios = [
      ['60', '50', '40'],
      ['61', '51', '41'],
    ];
    expect(result.R9?.to_js()).toEqual(expectedFeeRatios);
  });
});
