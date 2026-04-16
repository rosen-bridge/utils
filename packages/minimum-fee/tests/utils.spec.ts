import * as wasm from 'ergo-lib-wasm-nodejs';

import { extractFeeFromBox } from '../lib';
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
    const decodeRegister = (register: string) => {
      return wasm.Constant.decode_from_base16(register).to_js();
    };
    const result = extractFeeFromBox(testData.normalFeeBox, decodeRegister);
    expect(result).toEqual(testData.normalFee);
  });
});
