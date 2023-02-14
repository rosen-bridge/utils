import { KoiosRosenExtractor } from '../../../lib';
import CardanoTestUtils from './CardanoTestUtils';
import TestUtils from '../TestUtils';
import { ERGO_CHAIN } from '../../../lib/getRosenData/const';

describe('KoiosRosenExtractor', () => {
  describe('get', () => {
    /**
     * Target: KoiosRosenExtractor.get
     * Dependencies:
     *  -
     * Scenario:
     *  generate a transaction with valid rosen data (locking token)
     *  run test
     *  check return value
     * Expected:
     *  function returns rosenData object
     */
    it('should extract rosenData from token locking tx successfully', () => {
      // generate a transaction with valid rosen data (locking token)
      const validTokenLockTx =
        CardanoTestUtils.koiosTransactions.validTokenLock;

      // run test
      const extractor = new KoiosRosenExtractor(
        CardanoTestUtils.lockAddress,
        TestUtils.tokens
      );
      const result = extractor.get(validTokenLockTx);

      // check return value
      expect(result).toStrictEqual(
        CardanoTestUtils.koiosRosenData.validTokenLock
      );
    });

    /**
     * Target: KoiosRosenExtractor.get
     * Dependencies:
     *  -
     * Scenario:
     *  generate a transaction with valid rosen data (locking ADA)
     *  run test
     *  check return value
     * Expected:
     *  function returns rosenData object
     */
    it('should extract rosenData from ADA locking tx successfully', () => {
      // generate a transaction with valid rosen data (locking ADA)
      const validAdaLockTx = CardanoTestUtils.koiosTransactions.validAdaLock;

      // run test
      const extractor = new KoiosRosenExtractor(
        CardanoTestUtils.lockAddress,
        TestUtils.tokens
      );
      const result = extractor.get(validAdaLockTx);

      // check return value
      expect(result).toStrictEqual(
        CardanoTestUtils.koiosRosenData.validAdaLock
      );
    });

    /**
     * Target: KoiosRosenExtractor.get
     * Dependencies:
     *  -
     * Scenario:
     *  generate a transaction with no lock box
     *  run test
     *  check return value
     * Expected:
     *  function returns rosenData object
     */
    it('should return undefined when tx locks nothing', () => {
      // generate a transaction with no lock box
      const noLock = CardanoTestUtils.koiosTransactions.noLock;

      // run test
      const extractor = new KoiosRosenExtractor(
        CardanoTestUtils.lockAddress,
        TestUtils.tokens
      );
      const result = extractor.get(noLock);

      // check return value
      expect(result).toBeUndefined();
    });

    /**
     * Target: KoiosRosenExtractor.get
     * Dependencies:
     *  -
     * Scenario:
     *  generate a transaction with invalid rosen data (missing fromAddress key)
     *  run test
     *  check return value
     * Expected:
     *  function returns undefined
     */
    it.each(['to', 'bridgeFee', 'networkFee', 'toAddress', 'fromAddress'])(
      'should return undefined when tx metadata does NOT contain %p',
      (key) => {
        // generate a transaction with invalid rosen data (missing fromAddress key)
        const invalidTx = JSON.parse(
          JSON.stringify(
            CardanoTestUtils.koiosTransactions.validTokenLock
          ).replace(key, key + 'Fake')
        );

        // run test
        const extractor = new KoiosRosenExtractor(
          CardanoTestUtils.lockAddress,
          TestUtils.tokens
        );
        const result = extractor.get(invalidTx);

        // check return value
        expect(result).toBeUndefined();
      }
    );
  });

  describe('getAssetTransformation', () => {
    const toChain = ERGO_CHAIN;

    /**
     * Target: KoiosRosenExtractor.getAssetTransformation
     * Dependencies:
     *  -
     * Scenario:
     *  generate a UTXO with valid asset transformation
     *  run test
     *  check return value
     * Expected:
     *  function returns tokenTransformation object
     */
    it('should extract asset transformation from token locked UTXO successfully', () => {
      // generate a UTXO with valid asset transformation
      const tokenLockedUtxo = CardanoTestUtils.koiosUtxos.tokenLocked;

      // run test
      const extractor = new KoiosRosenExtractor(
        CardanoTestUtils.lockAddress,
        TestUtils.tokens
      );
      const result = extractor.getAssetTransformation(tokenLockedUtxo, toChain);

      // check return value
      expect(result).toStrictEqual(
        CardanoTestUtils.koiosAssetTransformations.tokenLocked
      );
    });

    /**
     * Target: KoiosRosenExtractor.getAssetTransformation
     * Dependencies:
     *  -
     * Scenario:
     *  generate a UTXO with valid native token transformation
     *  run test
     *  check return value
     * Expected:
     *  function returns tokenTransformation object
     */
    it('should extract asset transformation from ADA locked UTXO successfully', () => {
      // generate a UTXO with valid native token transformation
      const adaLockedUtxo = CardanoTestUtils.koiosUtxos.adaLocked;

      // run test
      const extractor = new KoiosRosenExtractor(
        CardanoTestUtils.lockAddress,
        TestUtils.tokens
      );
      const result = extractor.getAssetTransformation(adaLockedUtxo, toChain);

      // check return value
      expect(result).toStrictEqual(
        CardanoTestUtils.koiosAssetTransformations.adaLocked
      );
    });

    /**
     * Target: KoiosRosenExtractor.getAssetTransformation
     * Dependencies:
     *  -
     * Scenario:
     *  generate a UTXO with invalid asset transformation
     *  run test
     *  check return value
     * Expected:
     *  function returns undefined
     */
    it('should return undefined when first locked asset is not supported', () => {
      // generate a UTXO with invalid asset transformation
      const adaLockedUtxo = CardanoTestUtils.koiosUtxos.wrongAssetLocked;

      // run test
      const extractor = new KoiosRosenExtractor(
        CardanoTestUtils.lockAddress,
        TestUtils.tokens
      );
      const result = extractor.getAssetTransformation(adaLockedUtxo, toChain);

      // check return value
      expect(result).toBeUndefined();
    });

    /**
     * Target: KoiosRosenExtractor.getAssetTransformation
     * Dependencies:
     *  -
     * Scenario:
     *  generate a UTXO with native token transformation
     *  run test (generate extractor with a tokenMap that does NOT support native token)
     *  check return value
     * Expected:
     *  function returns undefined
     */
    it('should return undefined when no asset locked and ADA is not supported', () => {
      // generate a UTXO with invalid asset transformation
      const adaLockedUtxo = CardanoTestUtils.koiosUtxos.adaLocked;

      // run test
      const extractor = new KoiosRosenExtractor(
        CardanoTestUtils.lockAddress,
        TestUtils.noNativeTokens
      );
      const result = extractor.getAssetTransformation(adaLockedUtxo, toChain);

      // check return value
      expect(result).toBeUndefined();
    });
  });
});
