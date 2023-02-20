import { ErgoNodeRosenExtractor } from '../../../lib';
import ErgoTestData from './ErgoTestData';
import TestUtils from '../TestUtils';
import { NodeTransaction } from '../../../lib/getRosenData/ergo/types';
import { CARDANO_CHAIN } from '../../../lib/getRosenData/const';

describe('ErgoNodeRosenExtractor', () => {
  describe('get', () => {
    /**
     * Target: ErgoErgoNodeRosenExtractor.get
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
      const validTokenLockTx = ErgoTestData.nodeTransactions.validTokenLock;

      // run test
      const extractor = new ErgoNodeRosenExtractor(
        ErgoTestData.lockAddress,
        TestUtils.tokens
      );
      const result = extractor.get(
        validTokenLockTx as unknown as NodeTransaction
      );

      // check return value
      expect(result).toStrictEqual(ErgoTestData.nodeRosenData.validTokenLock);
    });

    /**
     * Target: ErgoErgoNodeRosenExtractor.get
     * Dependencies:
     *  -
     * Scenario:
     *  generate a transaction with valid rosen data (locking Erg)
     *  run test
     *  check return value
     * Expected:
     *  function returns rosenData object
     */
    it('should extract rosenData from Erg locking tx successfully', () => {
      // generate a transaction with valid rosen data (locking Erg)
      const validErgLockTx = ErgoTestData.nodeTransactions.validErgLock;

      // run test
      const extractor = new ErgoNodeRosenExtractor(
        ErgoTestData.lockAddress,
        TestUtils.tokens
      );
      const result = extractor.get(
        validErgLockTx as unknown as NodeTransaction
      );

      // check return value
      expect(result).toStrictEqual(ErgoTestData.nodeRosenData.validErgLock);
    });

    /**
     * Target: ErgoNodeRosenExtractor.get
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
      const noLock = ErgoTestData.nodeTransactions.noLock;

      // run test
      const extractor = new ErgoNodeRosenExtractor(
        ErgoTestData.lockAddress,
        TestUtils.tokens
      );
      const result = extractor.get(noLock as unknown as NodeTransaction);

      // check return value
      expect(result).toBeUndefined();
    });

    /**
     * Target: ErgoNodeRosenExtractor.get
     * Dependencies:
     *  -
     * Scenario:
     *  generate a transaction with invalid rosen data (fewer values in register)
     *  run test
     *  check return value
     * Expected:
     *  function returns undefined
     */
    it('should return undefined when lock box R4 register does NOT contain enough values', () => {
      // generate a transaction with invalid rosen data (fewer values in register)
      const fewerValues = ErgoTestData.nodeTransactions.fewerValues;

      // run test
      const extractor = new ErgoNodeRosenExtractor(
        ErgoTestData.lockAddress,
        TestUtils.tokens
      );
      const result = extractor.get(fewerValues as unknown as NodeTransaction);

      // check return value
      expect(result).toBeUndefined();
    });

    /**
     * Target: ErgoNodeRosenExtractor.get
     * Dependencies:
     *  -
     * Scenario:
     *  generate a transaction with invalid rosen data (invalid register type)
     *  run test
     *  check return value
     * Expected:
     *  function returns undefined
     */
    it('should return undefined when lock box R4 register type is invalid', () => {
      // generate a transaction with invalid rosen data (invalid register type)
      const invalidRegisterType =
        ErgoTestData.nodeTransactions.invalidRegisterType;

      // run test
      const extractor = new ErgoNodeRosenExtractor(
        ErgoTestData.lockAddress,
        TestUtils.tokens
      );
      const result = extractor.get(
        invalidRegisterType as unknown as NodeTransaction
      );

      // check return value
      expect(result).toBeUndefined();
    });
  });

  describe('getAssetTransformation', () => {
    const toChain = CARDANO_CHAIN;

    /**
     * Target: ErgoNodeRosenExtractor.getAssetTransformation
     * Dependencies:
     *  -
     * Scenario:
     *  generate a box with valid asset transformation
     *  run test
     *  check return value
     * Expected:
     *  function returns tokenTransformation object
     */
    it('should extract asset transformation from token locked box successfully', () => {
      // generate a box with valid asset transformation
      const tokenLockedBox = ErgoTestData.nodeBoxes.tokenLocked;

      // run test
      const extractor = new ErgoNodeRosenExtractor(
        ErgoTestData.lockAddress,
        TestUtils.tokens
      );
      const result = extractor.getAssetTransformation(tokenLockedBox, toChain);

      // check return value
      expect(result).toStrictEqual(
        ErgoTestData.nodeAssetTransformation.tokenLocked
      );
    });

    /**
     * Target: ErgoNodeRosenExtractor.getAssetTransformation
     * Dependencies:
     *  -
     * Scenario:
     *  generate a box with valid native token transformation
     *  run test
     *  check return value
     * Expected:
     *  function returns tokenTransformation object
     */
    it('should extract asset transformation from Erg locked box successfully', () => {
      // generate a box with valid native token transformation
      const ergLockedBox = ErgoTestData.nodeBoxes.ergLocked;

      // run test
      const extractor = new ErgoNodeRosenExtractor(
        ErgoTestData.lockAddress,
        TestUtils.tokens
      );
      const result = extractor.getAssetTransformation(ergLockedBox, toChain);

      // check return value
      expect(result).toStrictEqual(
        ErgoTestData.nodeAssetTransformation.ergLocked
      );
    });

    /**
     * Target: ErgoNodeRosenExtractor.getAssetTransformation
     * Dependencies:
     *  -
     * Scenario:
     *  generate a box with valid asset transformation in index 1
     *  run test
     *  check return value
     * Expected:
     *  function returns tokenTransformation object
     */
    it('should be able to extract asset transformation regardless of asset position', () => {
      // generate a box with valid asset transformation in index 1
      const ergLockedBox = ErgoTestData.nodeBoxes.secondTokenLocked;

      // run test
      const extractor = new ErgoNodeRosenExtractor(
        ErgoTestData.lockAddress,
        TestUtils.tokens
      );
      const result = extractor.getAssetTransformation(ergLockedBox, toChain);

      // check return value
      expect(result).toStrictEqual(
        ErgoTestData.nodeAssetTransformation.tokenLocked
      );
    });

    /**
     * Target: ErgoNodeRosenExtractor.getAssetTransformation
     * Dependencies:
     *  -
     * Scenario:
     *  generate a box with invalid asset transformation
     *  run test
     *  check return value
     * Expected:
     *  function returns tokenTransformation object
     */
    it('should return Erg transformation when no locked asset is not supported', () => {
      // generate a box with invalid asset transformation
      const ergLockedBox = ErgoTestData.nodeBoxes.wrongTokenLocked;

      // run test
      const extractor = new ErgoNodeRosenExtractor(
        ErgoTestData.lockAddress,
        TestUtils.tokens
      );
      const result = extractor.getAssetTransformation(ergLockedBox, toChain);

      // check return value
      expect(result).toStrictEqual(
        ErgoTestData.nodeAssetTransformation.wrongTokenLocked
      );
    });

    /**
     * Target: ErgoNodeRosenExtractor.getAssetTransformation
     * Dependencies:
     *  -
     * Scenario:
     *  generate a box with native token transformation
     *  run test (generate extractor with a tokenMap that does NOT support native token)
     *  check return value
     * Expected:
     *  function returns undefined
     */
    it('should return undefined when no asset locked and Erg is not supported', () => {
      // generate a box with invalid asset transformation
      const ergLockedBox = ErgoTestData.nodeBoxes.ergLocked;

      // run test
      const extractor = new ErgoNodeRosenExtractor(
        ErgoTestData.lockAddress,
        TestUtils.noNativeTokens
      );
      const result = extractor.getAssetTransformation(ergLockedBox, toChain);

      // check return value
      expect(result).toBeUndefined();
    });
  });
});
