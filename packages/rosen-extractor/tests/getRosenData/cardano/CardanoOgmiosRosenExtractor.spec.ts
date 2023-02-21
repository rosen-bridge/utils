import { CardanoOgmiosRosenExtractor } from '../../../lib';
import CardanoTestData from './CardanoTestData';
import TestUtils from '../TestUtils';
import { TxBabbage } from '@cardano-ogmios/schema';
import Utils from '../../../lib/getRosenData/Utils';
import { ERGO_CHAIN } from '../../../lib/getRosenData/const';

describe('OgmiosRosenExtractor', () => {
  describe('get', () => {
    /**
     * Target: OgmiosRosenExtractor.get
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
      const validTokenLockTx = CardanoTestData.ogmiosTransactions
        .validTokenLock as unknown as TxBabbage;

      // run test
      const extractor = new CardanoOgmiosRosenExtractor(
        CardanoTestData.lockAddress,
        TestUtils.tokens
      );
      const result = extractor.get(validTokenLockTx);

      // check return value
      expect(result).toStrictEqual(
        CardanoTestData.ogmiosRosenData.validTokenLock
      );
    });

    /**
     * Target: OgmiosRosenExtractor.get
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
      const validAdaLockTx = CardanoTestData.ogmiosTransactions
        .validAdaLock as unknown as TxBabbage;

      // run test
      const extractor = new CardanoOgmiosRosenExtractor(
        CardanoTestData.lockAddress,
        TestUtils.tokens
      );
      const result = extractor.get(validAdaLockTx);

      // check return value
      expect(result).toStrictEqual(
        CardanoTestData.ogmiosRosenData.validAdaLock
      );
    });

    /**
     * Target: OgmiosRosenExtractor.get
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
      const noLock = CardanoTestData.ogmiosTransactions
        .noLock as unknown as TxBabbage;

      // run test
      const extractor = new CardanoOgmiosRosenExtractor(
        CardanoTestData.lockAddress,
        TestUtils.tokens
      );
      const result = extractor.get(noLock);

      // check return value
      expect(result).toBeUndefined();
    });

    /**
     * Target: OgmiosRosenExtractor.get
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
        const invalidMetadata = Utils.JsonBI.parse(
          Utils.JsonBI.stringify(
            CardanoTestData.ogmiosAuxiliaryData.validEvent
          ).replace(key, key + 'Fake')
        );
        const invalidTx = CardanoTestData.ogmiosTransactions.validTokenLock;
        invalidTx.metadata = invalidMetadata;

        // run test
        const extractor = new CardanoOgmiosRosenExtractor(
          CardanoTestData.lockAddress,
          TestUtils.tokens
        );
        const result = extractor.get(invalidTx as unknown as TxBabbage);

        // check return value
        expect(result).toBeUndefined();
      }
    );

    /**
     * Target: OgmiosRosenExtractor.get
     * Dependencies:
     *  -
     * Scenario:
     *  generate a transaction with no rosen data
     *  run test
     *  check return value
     * Expected:
     *  function returns rosenData object
     */
    it('should return undefined when tx does NOT contain metadata', () => {
      // generate a transaction with no rosen data
      const noLock = CardanoTestData.ogmiosTransactions
        .noMetadata as unknown as TxBabbage;

      // run test
      const extractor = new CardanoOgmiosRosenExtractor(
        CardanoTestData.lockAddress,
        TestUtils.tokens
      );
      const result = extractor.get(noLock);

      // check return value
      expect(result).toBeUndefined();
    });

    /**
     * Target: OgmiosRosenExtractor.get
     * Dependencies:
     *  -
     * Scenario:
     *  generate a transaction with invalid rosen data (no blob key in metadata)
     *  run test
     *  check return value
     * Expected:
     *  function returns rosenData object
     */
    it('should return undefined when metadata has no blob', () => {
      // generate a transaction with invalid rosen data (no blob key in metadata)
      const noLock = CardanoTestData.ogmiosTransactions
        .noBlobMetadata as unknown as TxBabbage;

      // run test
      const extractor = new CardanoOgmiosRosenExtractor(
        CardanoTestData.lockAddress,
        TestUtils.tokens
      );
      const result = extractor.get(noLock);

      // check return value
      expect(result).toBeUndefined();
    });

    /**
     * Target: OgmiosRosenExtractor.get
     * Dependencies:
     *  -
     * Scenario:
     *  generate a transaction with invalid rosen data (no '0' key in blob)
     *  run test
     *  check return value
     * Expected:
     *  function returns rosenData object
     */
    it("should return undefined when metadata blob does NOT contain '0' key", () => {
      // generate a transaction with invalid rosen data (no '0' key in blob)
      const noLock = CardanoTestData.ogmiosTransactions
        .noBlobZeroKeyMetadata as unknown as TxBabbage;

      // run test
      const extractor = new CardanoOgmiosRosenExtractor(
        CardanoTestData.lockAddress,
        TestUtils.tokens
      );
      const result = extractor.get(noLock);

      // check return value
      expect(result).toBeUndefined();
    });

    /**
     * Target: OgmiosRosenExtractor.get
     * Dependencies:
     *  -
     * Scenario:
     *  generate a transaction with invalid rosen data (invalid type metadata)
     *  run test
     *  check return value
     * Expected:
     *  function returns rosenData object
     */
    it('should return undefined when rosenData contains invalid type for a required key', () => {
      // generate a transaction with invalid rosen data (invalid type metadata)
      const noLock = CardanoTestData.ogmiosTransactions
        .invalidTypeMetadata as unknown as TxBabbage;

      // run test
      const extractor = new CardanoOgmiosRosenExtractor(
        CardanoTestData.lockAddress,
        TestUtils.tokens
      );
      const result = extractor.get(noLock);

      // check return value
      expect(result).toBeUndefined();
    });

    /**
     * Target: OgmiosRosenExtractor.get
     * Dependencies:
     *  -
     * Scenario:
     *  generate a transaction with invalid rosen data (metadata is not json)
     *  run test
     *  check return value
     * Expected:
     *  function returns rosenData object
     */
    it('should return undefined when metadata is not json', () => {
      // generate a transaction with invalid rosen data (no json in metadata)
      const noLock = CardanoTestData.ogmiosTransactions
        .noJsonMetadata as unknown as TxBabbage;

      // run test
      const extractor = new CardanoOgmiosRosenExtractor(
        CardanoTestData.lockAddress,
        TestUtils.tokens
      );
      const result = extractor.get(noLock);

      // check return value
      expect(result).toBeUndefined();
    });
  });

  describe('getAssetTransformation', () => {
    const toChain = ERGO_CHAIN;

    /**
     * Target: OgmiosRosenExtractor.getAssetTransformation
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
      const tokenLockedUtxo = CardanoTestData.ogmiosTxOuts.tokenLocked;

      // run test
      const extractor = new CardanoOgmiosRosenExtractor(
        CardanoTestData.lockAddress,
        TestUtils.tokens
      );
      const result = extractor.getAssetTransformation(tokenLockedUtxo, toChain);

      // check return value
      expect(result).toStrictEqual(
        CardanoTestData.ogmiosAssetTransformations.tokenLocked
      );
    });

    /**
     * Target: OgmiosRosenExtractor.getAssetTransformation
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
      const adaLockedUtxo = CardanoTestData.ogmiosTxOuts.adaLocked;

      // run test
      const extractor = new CardanoOgmiosRosenExtractor(
        CardanoTestData.lockAddress,
        TestUtils.tokens
      );
      const result = extractor.getAssetTransformation(adaLockedUtxo, toChain);

      // check return value
      expect(result).toStrictEqual(
        CardanoTestData.ogmiosAssetTransformations.adaLocked
      );
    });

    /**
     * Target: OgmiosRosenExtractor.getAssetTransformation
     * Dependencies:
     *  -
     * Scenario:
     *  generate a UTXO with valid asset transformation in index 1
     *  run test
     *  check return value
     * Expected:
     *  function returns tokenTransformation object
     */
    it('should be able to extract asset transformation regardless of asset position', () => {
      // generate a UTXO with valid asset transformation in index 1
      const adaLockedUtxo = CardanoTestData.ogmiosTxOuts.secondAssetLocked;

      // run test
      const extractor = new CardanoOgmiosRosenExtractor(
        CardanoTestData.lockAddress,
        TestUtils.tokens
      );
      const result = extractor.getAssetTransformation(adaLockedUtxo, toChain);

      // check return value
      expect(result).toStrictEqual(
        CardanoTestData.ogmiosAssetTransformations.tokenLocked
      );
    });

    /**
     * Target: OgmiosRosenExtractor.getAssetTransformation
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
      const adaLockedUtxo = CardanoTestData.ogmiosTxOuts.wrongAssetLocked;

      // run test
      const extractor = new CardanoOgmiosRosenExtractor(
        CardanoTestData.lockAddress,
        TestUtils.tokens
      );
      const result = extractor.getAssetTransformation(adaLockedUtxo, toChain);

      // check return value
      expect(result).toStrictEqual(
        CardanoTestData.ogmiosAssetTransformations.wrongAssetLocked
      );
    });

    /**
     * Target: OgmiosRosenExtractor.getAssetTransformation
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
      const adaLockedUtxo = CardanoTestData.ogmiosTxOuts.adaLocked;

      // run test
      const extractor = new CardanoOgmiosRosenExtractor(
        CardanoTestData.lockAddress,
        TestUtils.noNativeTokens
      );
      const result = extractor.getAssetTransformation(adaLockedUtxo, toChain);

      // check return value
      expect(result).toBeUndefined();
    });
  });
});
