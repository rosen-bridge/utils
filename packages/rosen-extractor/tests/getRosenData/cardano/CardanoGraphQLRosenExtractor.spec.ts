import { CardanoGraphQLRosenExtractor } from '../../../lib';
import * as testData from './GraphQLTestData';
import TestUtils from '../TestUtils';
import { ERGO_CHAIN } from '../../../lib/getRosenData/const';

describe('GraphQLRosenExtractor', () => {
  describe('get', () => {
    /**
     * Target: GraphQLRosenExtractor.get
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
      const validTokenLockTx = testData.graphQLTransactions.validTokenLock;

      // run test
      const extractor = new CardanoGraphQLRosenExtractor(
        testData.lockAddress,
        TestUtils.tokens
      );
      const result = extractor.get(validTokenLockTx);

      // check return value
      expect(result).toStrictEqual(testData.graphQLRosenData.validTokenLock);
    });

    /**
     * Target: GraphQLRosenExtractor.get
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
      const validAdaLockTx = testData.graphQLTransactions.validAdaLock;

      // run test
      const extractor = new CardanoGraphQLRosenExtractor(
        testData.lockAddress,
        TestUtils.tokens
      );
      const result = extractor.get(validAdaLockTx);

      // check return value
      expect(result).toStrictEqual(testData.graphQLRosenData.validAdaLock);
    });

    /**
     * Target: GraphQLRosenExtractor.get
     * Dependencies:
     *  -
     * Scenario:
     *  generate a transaction with no lock box
     *  run test
     *  check return value
     * Expected:
     *  function returns undefined
     */
    it('should return undefined when tx locks nothing', () => {
      // generate a transaction with no lock box
      const noLock = testData.graphQLTransactions.noLock;

      // run test
      const extractor = new CardanoGraphQLRosenExtractor(
        testData.lockAddress,
        TestUtils.tokens
      );
      const result = extractor.get(noLock);

      // check return value
      expect(result).toBeUndefined();
    });

    /**
     * Target: GraphQLRosenExtractor.get
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
        // generate a transaction with invalid rosen data (missing a key)
        const invalidTx = JSON.parse(
          JSON.stringify(testData.graphQLTransactions.validTokenLock).replace(
            key + '":',
            key + 'Fake":'
          )
        );

        // run test
        const extractor = new CardanoGraphQLRosenExtractor(
          testData.lockAddress,
          TestUtils.tokens
        );
        const result = extractor.get(invalidTx);

        // check return value
        expect(result).toBeUndefined();
      }
    );

    /**
     * Target: GraphQLRosenExtractor.get
     * Dependencies:
     *  -
     * Scenario:
     *  generate a transaction with no rosen data
     *  run test
     *  check return value
     * Expected:
     *  function returns undefined
     */
    it('should return undefined when tx does NOT contain metadata', () => {
      // generate a transaction with no rosen data
      const noMetadata = testData.graphQLTransactions.noMetadata;

      // run test
      const extractor = new CardanoGraphQLRosenExtractor(
        testData.lockAddress,
        TestUtils.tokens
      );
      const result = extractor.get(noMetadata);

      // check return value
      expect(result).toBeUndefined();
    });

    /**
     * Target: GraphQLRosenExtractor.get
     * Dependencies:
     *  -
     * Scenario:
     *  generate a transaction with invalid rosen data (no '0' key in metadata)
     *  run test
     *  check return value
     * Expected:
     *  function returns undefined
     */
    it("should return undefined when metadata does NOT contain '0' key", () => {
      // generate a transaction with invalid rosen data (no '0' key in metadata)
      const noZeroKeyMetadata = testData.graphQLTransactions.noZeroKeyMetadata;

      // run test
      const extractor = new CardanoGraphQLRosenExtractor(
        testData.lockAddress,
        TestUtils.tokens
      );
      const result = extractor.get(noZeroKeyMetadata);

      // check return value
      expect(result).toBeUndefined();
    });

    /**
     * Target: GraphQLRosenExtractor.get
     * Dependencies:
     *  -
     * Scenario:
     *  generate a transaction with invalid rosen data (metadata value is string)
     *  run test
     *  check return value
     * Expected:
     *  function returns undefined
     */
    it('should return undefined when metadata is string', () => {
      // generate a transaction with invalid rosen data (metadata value is string)
      const stringMetadata = testData.graphQLTransactions.stringMetadata;

      // run test
      const extractor = new CardanoGraphQLRosenExtractor(
        testData.lockAddress,
        TestUtils.tokens
      );
      const result = extractor.get(stringMetadata);

      // check return value
      expect(result).toBeUndefined();
    });
  });

  describe('getAssetTransformation', () => {
    const toChain = ERGO_CHAIN;

    /**
     * Target: GraphQLRosenExtractor.getAssetTransformation
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
      const tokenLockedUtxo = testData.graphQLUtxos.tokenLocked;

      // run test
      const extractor = new CardanoGraphQLRosenExtractor(
        testData.lockAddress,
        TestUtils.tokens
      );
      const result = extractor.getAssetTransformation(tokenLockedUtxo, toChain);

      // check return value
      expect(result).toStrictEqual(
        testData.graphQLAssetTransformations.tokenLocked
      );
    });

    /**
     * Target: GraphQLRosenExtractor.getAssetTransformation
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
      const adaLockedUtxo = testData.graphQLUtxos.adaLocked;

      // run test
      const extractor = new CardanoGraphQLRosenExtractor(
        testData.lockAddress,
        TestUtils.tokens
      );
      const result = extractor.getAssetTransformation(adaLockedUtxo, toChain);

      // check return value
      expect(result).toStrictEqual(
        testData.graphQLAssetTransformations.adaLocked
      );
    });

    /**
     * Target: GraphQLRosenExtractor.getAssetTransformation
     * Dependencies:
     *  -
     * Scenario:
     *  generate a UTXO with invalid asset transformation
     *  run test
     *  check return value
     * Expected:
     *  function returns tokenTransformation object
     */
    it('should return ADA transformation when no locked asset is not supported', () => {
      // generate a UTXO with invalid asset transformation
      const adaLockedUtxo = testData.graphQLUtxos.wrongAssetLocked;

      // run test
      const extractor = new CardanoGraphQLRosenExtractor(
        testData.lockAddress,
        TestUtils.tokens
      );
      const result = extractor.getAssetTransformation(adaLockedUtxo, toChain);

      // check return value
      expect(result).toStrictEqual(
        testData.graphQLAssetTransformations.wrongAssetLocked
      );
    });

    /**
     * Target: GraphQLRosenExtractor.getAssetTransformation
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
      const adaLockedUtxo = testData.graphQLUtxos.adaLocked;

      // run test
      const extractor = new CardanoGraphQLRosenExtractor(
        testData.lockAddress,
        TestUtils.noNativeTokens
      );
      const result = extractor.getAssetTransformation(adaLockedUtxo, toChain);

      // check return value
      expect(result).toBeUndefined();
    });
  });
});
