import { ERGO_CHAIN } from '../../../lib/getRosenData/const';
import CardanoTestData from './CardanoTestData';
import { CardanoRosenExtractor } from '../../../lib';
import TestUtils from '../TestUtils';
import * as JSONBigInt from 'json-bigint';

describe('CardanoRosenExtractor', () => {
  describe('get', () => {
    /**
     * Target: CardanoRosenExtractor.get should extract rosenData from token locking tx successfully
     * Dependencies:
     * Scenario:
     * - generate a transaction with valid rosen data (locking token)
     * - run test
     * - check return value
     * Expected:
     * - function returns rosenData object
     */
    it('should extract rosenData from token locking tx successfully', () => {
      // generate a transaction with valid rosen data (locking token)
      const validTokenLockTx = CardanoTestData.rosenTransactions.validTokenLock;

      // run test
      const extractor = new CardanoRosenExtractor(
        CardanoTestData.lockAddress,
        TestUtils.tokens
      );
      const result = extractor.get(JSONBigInt.stringify(validTokenLockTx));

      // check return value
      expect(result).toStrictEqual(
        CardanoTestData.rosenRosenData.validTokenLock
      );
    });

    /**
     * Target: CardanoRosenExtractor.get should extract rosenData from ADA locking tx successfully
     * Dependencies:
     * Scenario:
     * - generate a transaction with valid rosen data (locking ADA)
     * - run test
     * - check return value
     * Expected:
     * - function returns rosenData object
     */
    it('should extract rosenData from ADA locking tx successfully', () => {
      // generate a transaction with valid rosen data (locking ADA)
      const validADALockTx = CardanoTestData.rosenTransactions.validAdaLock;

      // run test
      const extractor = new CardanoRosenExtractor(
        CardanoTestData.lockAddress,
        TestUtils.tokens
      );
      const result = extractor.get(JSONBigInt.stringify(validADALockTx));

      // check return value
      expect(result).toStrictEqual(CardanoTestData.rosenRosenData.validADALock);
    });

    /**
     * Target: CardanoRosenExtractor.get should return undefined when tx locks nothing
     * Dependencies:
     * Scenario:
     * - generate a transaction with metadata which does not lock
     * - run test
     * - check return value
     * Expected:
     * - function returns undefined
     */
    it('should return undefined when tx locks nothing', () => {
      // generate a transaction with metadata which does not lock
      const noLockTx = CardanoTestData.rosenTransactions.noLock;

      // run test
      const extractor = new CardanoRosenExtractor(
        CardanoTestData.lockAddress,
        TestUtils.tokens
      );
      const result = extractor.get(JSONBigInt.stringify(noLockTx));

      // check return value
      expect(result).toBeUndefined();
    });

    /**
     * Target: CardanoRosenExtractor.get should return undefined when tx does NOT contain metadata
     * Dependencies:
     * Scenario:
     * - generate a transaction with valid no metadata
     * - run test
     * - check return value
     * Expected:
     * - function returns undefined
     */
    it('should return undefined when tx does NOT contain metadata', () => {
      // generate a transaction with valid no metadata
      const validADALockTx = CardanoTestData.rosenTransactions.validAdaLock;
      const noMetadataTx = {
        ...validADALockTx,
        metadata: [],
      };

      // run test
      const extractor = new CardanoRosenExtractor(
        CardanoTestData.lockAddress,
        TestUtils.tokens
      );
      const result = extractor.get(JSONBigInt.stringify(noMetadataTx));

      // check return value
      expect(result).toBeUndefined();
    });

    /**
     * Target: CardanoRosenExtractor.get should return undefined when tx metadata does NOT contain %p
     * Dependencies:
     * Scenario:
     * - generate a transaction with valid no metadata
     * - run test
     * - check return value
     * Expected:
     * - function returns undefined
     */
    it.each(['to', 'bridgeFee', 'networkFee', 'toAddress', 'fromAddress'])(
      'should return undefined when tx metadata does NOT contain %p',
      (key) => {
        // generate a transaction with missing property from metadata
        const invalidTx = JSONBigInt.stringify(
          CardanoTestData.rosenTransactions.validTokenLock
        ).replace(key, key + 'Fake');

        // run test
        const extractor = new CardanoRosenExtractor(
          CardanoTestData.lockAddress,
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
     * Target: KoiosRosenExtractor.getAssetTransformation should extract asset transformation
     * from token locked UTXO successfully
     * Dependencies:
     * Scenario:
     * - generate a UTXO with valid asset transformation
     * - run test
     * - check return value
     * Expected:
     * - function returns tokenTransformation object
     */
    it('should extract asset transformation from token locked UTXO successfully', () => {
      // generate a UTXO with valid asset transformation
      const tokenLockedUtxo = CardanoTestData.rosenUTXOs.tokenLocked;

      // run test
      const extractor = new CardanoRosenExtractor(
        CardanoTestData.lockAddress,
        TestUtils.tokens
      );
      const result = extractor.getAssetTransformation(tokenLockedUtxo, toChain);

      expect(result).toStrictEqual(
        CardanoTestData.rosenAssetTransformations.tokenLocked
      );
    });

    /**
     * Target: KoiosRosenExtractor.getAssetTransformation should extract asset transformation
     * from ADA locked UTXO successfully
     * Dependencies:
     * Scenario:
     * - generate a UTXO with valid asset transformation
     * - run test
     * - check return value
     * Expected:
     * - function returns tokenTransformation object
     */
    it('should extract asset transformation from ADA locked UTXO successfully', () => {
      // generate a UTXO with valid asset transformation
      const ADALockedUtxo = CardanoTestData.rosenUTXOs.adaLocked;

      // run test
      const extractor = new CardanoRosenExtractor(
        CardanoTestData.lockAddress,
        TestUtils.tokens
      );
      const result = extractor.getAssetTransformation(ADALockedUtxo, toChain);

      expect(result).toStrictEqual(
        CardanoTestData.rosenAssetTransformations.adaLocked
      );
    });

    /**
     * Target: KoiosRosenExtractor.getAssetTransformation should extract asset transformation
     * regardless of asset position
     * Dependencies:
     * Scenario:
     * - generate a UTXO with valid asset transformation
     * - run test
     * - check return value
     * Expected:
     * - function returns tokenTransformation object
     */
    it('should be able to extract asset transformation regardless of asset position', () => {
      // generate a UTXO with valid asset transformation
      const tokenLockedUtxo = CardanoTestData.rosenUTXOs.secondAssetLocked;

      // run test
      const extractor = new CardanoRosenExtractor(
        CardanoTestData.lockAddress,
        TestUtils.tokens
      );
      const result = extractor.getAssetTransformation(tokenLockedUtxo, toChain);

      expect(result).toStrictEqual(
        CardanoTestData.rosenAssetTransformations.tokenLocked
      );
    });

    /**
     * Target: should return ADA transformation when no locked asset is not supported
     * Dependencies:
     * Scenario:
     * - generate a UTXO with valid asset transformation
     * - run test
     * - check return value
     * Expected:
     * - function returns tokenTransformation object
     */
    it('should return ADA transformation when no locked asset is not supported', () => {
      // generate a UTXO with valid asset transformation
      const tokenLockedUtxo = CardanoTestData.rosenUTXOs.wrongTokenLocked;

      // run test
      const extractor = new CardanoRosenExtractor(
        CardanoTestData.lockAddress,
        TestUtils.tokens
      );
      const result = extractor.getAssetTransformation(tokenLockedUtxo, toChain);

      expect(result).toStrictEqual(
        CardanoTestData.rosenAssetTransformations.adaLocked
      );
    });

    /**
     * Target: should return undefined when no asset locked and ADA is not supported
     * Dependencies:
     * Scenario:
     * - generate a UTXO with valid asset transformation
     * - run test
     * - check return value
     * Expected:
     * - function returns tokenTransformation object
     */
    it('should return undefined when no asset locked and ADA is not supported', () => {
      // generate a UTXO with valid asset transformation
      const tokenLockedUtxo = CardanoTestData.rosenUTXOs.wrongTokenLocked;

      // run test
      const extractor = new CardanoRosenExtractor(
        CardanoTestData.lockAddress,
        TestUtils.noNativeTokens
      );
      const result = extractor.getAssetTransformation(tokenLockedUtxo, toChain);

      expect(result).toBeUndefined();
    });
  });
});
