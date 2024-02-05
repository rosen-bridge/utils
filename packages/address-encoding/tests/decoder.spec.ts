import * as testData from './testData';
import { addressDecoder } from '../lib';
import { BITCOIN_CHAIN, CARDANO_CHAIN, ERGO_CHAIN } from '../lib/const';

describe('addressDecoder', () => {
  /**
   * @target `addressDecoder` should decode Ergo address successfully
   * @dependencies
   * @scenario
   * - run test
   * - check returned value
   * @expected
   * - it should be address in base58 format
   */
  it('should decode Ergo address successfully', () => {
    const res = addressDecoder(ERGO_CHAIN, testData.encodedErgoAddress);
    expect(res).toEqual(testData.ergoAddress);
  });

  /**
   * @target `addressDecoder` should decode Cardano address successfully
   * @dependencies
   * @scenario
   * - run test
   * - check returned value
   * @expected
   * - it should be address in bech32 format
   */
  it('should decode Cardano address successfully', () => {
    const res = addressDecoder(CARDANO_CHAIN, testData.encodedCardanoAddress);
    expect(res).toEqual(testData.cardanoAddress);
  });

  /**
   * @target `addressDecoder` should decode Bitcoin address successfully
   * @dependencies
   * @scenario
   * - run test
   * - check returned value
   * @expected
   * - it should be address in bech32 format
   */
  it('should decode Bitcoin address successfully', () => {
    const res = addressDecoder(BITCOIN_CHAIN, testData.encodedBitcoinAddress);
    expect(res).toEqual(testData.bitcoinAddress);
  });
});
