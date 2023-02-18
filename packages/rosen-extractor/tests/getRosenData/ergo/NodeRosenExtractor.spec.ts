import { NodeRosenExtractor } from '../../../lib';
import ErgoTestUtils from './ErgoTestUtils';
import TestUtils from '../TestUtils';
import { NodeTransaction } from '../../../lib/getRosenData/ergo/types';
import { CARDANO_CHAIN } from '../../../lib/getRosenData/const';

describe('NodeRosenExtractor', () => {
  describe('get', () => {
    /**
     * Target: NodeRosenExtractor.get
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
      const validTokenLockTx = ErgoTestUtils.nodeTransactions.validTokenLock;

      // run test
      const extractor = new NodeRosenExtractor(
        ErgoTestUtils.lockAddress,
        TestUtils.tokens
      );
      const result = extractor.get(
        validTokenLockTx as unknown as NodeTransaction
      );

      // check return value
      expect(result).toStrictEqual(ErgoTestUtils.nodeRosenData.validTokenLock);
    });

    /**
     * Target: NodeRosenExtractor.get
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
      const validErgLockTx = ErgoTestUtils.nodeTransactions.validErgLock;

      // run test
      const extractor = new NodeRosenExtractor(
        ErgoTestUtils.lockAddress,
        TestUtils.tokens
      );
      const result = extractor.get(
        validErgLockTx as unknown as NodeTransaction
      );

      // check return value
      expect(result).toStrictEqual(ErgoTestUtils.nodeRosenData.validErgLock);
    });

    /**
     * Target: NodeRosenExtractor.get
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
      const noLock = ErgoTestUtils.nodeTransactions.noLock;

      // run test
      const extractor = new NodeRosenExtractor(
        ErgoTestUtils.lockAddress,
        TestUtils.tokens
      );
      const result = extractor.get(noLock as unknown as NodeTransaction);

      // check return value
      expect(result).toBeUndefined();
    });

    /**
     * Target: NodeRosenExtractor.get
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
      const fewerValues = ErgoTestUtils.nodeTransactions.fewerValues;

      // run test
      const extractor = new NodeRosenExtractor(
        ErgoTestUtils.lockAddress,
        TestUtils.tokens
      );
      const result = extractor.get(fewerValues as unknown as NodeTransaction);

      // check return value
      expect(result).toBeUndefined();
    });

    /**
     * Target: NodeRosenExtractor.get
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
        ErgoTestUtils.nodeTransactions.invalidRegisterType;

      // run test
      const extractor = new NodeRosenExtractor(
        ErgoTestUtils.lockAddress,
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
     * Target: NodeRosenExtractor.getAssetTransformation
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
      const tokenLockedBox = ErgoTestUtils.nodeBoxes.tokenLocked;

      // run test
      const extractor = new NodeRosenExtractor(
        ErgoTestUtils.lockAddress,
        TestUtils.tokens
      );
      const result = extractor.getAssetTransformation(tokenLockedBox, toChain);

      // check return value
      expect(result).toStrictEqual(
        ErgoTestUtils.nodeAssetTransformation.tokenLocked
      );
    });

    /**
     * Target: NodeRosenExtractor.getAssetTransformation
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
      const ergLockedBox = ErgoTestUtils.nodeBoxes.ergLocked;

      // run test
      const extractor = new NodeRosenExtractor(
        ErgoTestUtils.lockAddress,
        TestUtils.tokens
      );
      const result = extractor.getAssetTransformation(ergLockedBox, toChain);

      // check return value
      expect(result).toStrictEqual(
        ErgoTestUtils.nodeAssetTransformation.ergLocked
      );
    });

    /**
     * Target: NodeRosenExtractor.getAssetTransformation
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
      const ergLockedBox = ErgoTestUtils.nodeBoxes.secondTokenLocked;

      // run test
      const extractor = new NodeRosenExtractor(
        ErgoTestUtils.lockAddress,
        TestUtils.tokens
      );
      const result = extractor.getAssetTransformation(ergLockedBox, toChain);

      // check return value
      expect(result).toStrictEqual(
        ErgoTestUtils.nodeAssetTransformation.tokenLocked
      );
    });

    /**
     * Target: NodeRosenExtractor.getAssetTransformation
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
      const ergLockedBox = ErgoTestUtils.nodeBoxes.wrongTokenLocked;

      // run test
      const extractor = new NodeRosenExtractor(
        ErgoTestUtils.lockAddress,
        TestUtils.tokens
      );
      const result = extractor.getAssetTransformation(ergLockedBox, toChain);

      // check return value
      expect(result).toStrictEqual(
        ErgoTestUtils.nodeAssetTransformation.wrongTokenLocked
      );
    });

    /**
     * Target: NodeRosenExtractor.getAssetTransformation
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
      const ergLockedBox = ErgoTestUtils.nodeBoxes.ergLocked;

      // run test
      const extractor = new NodeRosenExtractor(
        ErgoTestUtils.lockAddress,
        TestUtils.noNativeTokens
      );
      const result = extractor.getAssetTransformation(ergLockedBox, toChain);

      // check return value
      expect(result).toBeUndefined();
    });
  });
});

/**
 * 'should return undefined when register value is invalid'
 * 'should return undefined when register type is invalid'
 */
