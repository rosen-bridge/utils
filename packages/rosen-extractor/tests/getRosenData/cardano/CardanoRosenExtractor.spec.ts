import { ERGO_CHAIN } from '../../../lib/getRosenData/const';
import CardanoTestData from './CardanoTestData';
import { CardanoRosenExtractor } from '../../../lib';
import TestUtils from '../TestUtils';
import * as JSONBigInt from 'json-bigint';
import * as addressCodec from '@rosen-bridge/address-codec';

jest.mock('@rosen-bridge/address-codec', () => {
  return {
    __esModule: true,
    ...jest.requireActual('@rosen-bridge/address-codec'),
  };
});

describe('CardanoRosenExtractor', () => {
  describe('get', () => {
    /**
     * @target: CardanoRosenExtractor.get should extract rosenData from token locking tx successfully
     * @dependencies:
     * @scenario
     * - mock a valid token lock transaction
     * - run the test
     * - check returned value
     * @expected
     * - extracted data should be correct
     */
    it('should extract rosenData from token locking tx successfully', () => {
      // mock a valid token lock transaction
      const validTokenLockTx = CardanoTestData.rosenTransactions.validTokenLock;

      // run the test
      const extractor = new CardanoRosenExtractor(
        CardanoTestData.lockAddress,
        TestUtils.tokens
      );
      const result = extractor.get(JSONBigInt.stringify(validTokenLockTx));

      // check returned value
      expect(result).toStrictEqual(
        CardanoTestData.rosenRosenData.validTokenLock
      );
    });

    /**
     * @target: CardanoRosenExtractor.get should extract rosenData from ADA locking tx successfully
     * @dependencies:
     * @scenario
     * - mock a valid ADA lock transaction
     * - run the test
     * - check returned value
     * @expected
     * - extracted data should be correct
     */
    it('should extract rosenData from ADA locking tx successfully', () => {
      // mock a valid ADA lock transaction
      const validADALockTx = CardanoTestData.rosenTransactions.validAdaLock;

      // run the test
      const extractor = new CardanoRosenExtractor(
        CardanoTestData.lockAddress,
        TestUtils.tokens
      );
      const result = extractor.get(JSONBigInt.stringify(validADALockTx));

      // check returned value
      expect(result).toStrictEqual(CardanoTestData.rosenRosenData.validADALock);
    });

    /**
     * @target: CardanoRosenExtractor.get should return undefined when tx locks nothing
     * @dependencies:
     * @scenario
     * - mock a transaction that locks nothing
     * - run the test
     * - check returned value
     * @expected
     * - extractor should return undefined
     */
    it('should return undefined when tx locks nothing', () => {
      // mock a transaction that locks nothing
      const noLockTx = CardanoTestData.rosenTransactions.noLock;

      // run the test
      const extractor = new CardanoRosenExtractor(
        CardanoTestData.lockAddress,
        TestUtils.tokens
      );
      const result = extractor.get(JSONBigInt.stringify(noLockTx));

      // check returned value
      expect(result).toBeUndefined();
    });

    /**
     * @target: CardanoRosenExtractor.get should return undefined when tx does NOT contain metadata
     * @dependencies:
     * @scenario
     * - mock a transaction with no metadata
     * - run the test
     * - check returned value
     * @expected
     * - extractor should return undefined
     */
    it('should return undefined when tx does NOT contain metadata', () => {
      //  mock a transaction with no metadata
      const validADALockTx = CardanoTestData.rosenTransactions.validAdaLock;
      const noMetadataTx = {
        ...validADALockTx,
        metadata: [],
      };

      // run the test
      const extractor = new CardanoRosenExtractor(
        CardanoTestData.lockAddress,
        TestUtils.tokens
      );
      const result = extractor.get(JSONBigInt.stringify(noMetadataTx));

      // check returned value
      expect(result).toBeUndefined();
    });

    /**
     * @target: CardanoRosenExtractor.get should return undefined when type of tx metadata is invalid
     * @dependencies:
     * @scenario
     * - mock a transaction with invalid metadata type
     * - run the test
     * - check returned value
     * @expected
     * - extractor should return undefined
     */
    it('should return undefined when type of tx metadata is invalid', () => {
      //  mock a transaction with invalid metadata type
      const validADALockTx = CardanoTestData.rosenTransactions.validAdaLock;
      const invalidMetadataTx = {
        ...validADALockTx,
        metadata: {
          '0': 'invalidMetadataType',
        },
      };

      // run the test
      const extractor = new CardanoRosenExtractor(
        CardanoTestData.lockAddress,
        TestUtils.tokens
      );
      const result = extractor.get(JSONBigInt.stringify(invalidMetadataTx));

      // check returned value
      expect(result).toBeUndefined();
    });

    /**
     * @target: CardanoRosenExtractor.get should return undefined when tx metadata does NOT contain %p
     * @dependencies:
     * @scenario
     * - mock a transaction with missing property from metadata
     * - run the test
     * - check returned value
     * @expected
     * - extractor should return undefined
     */
    it.each(['to', 'bridgeFee', 'networkFee', 'toAddress', 'fromAddress'])(
      'should return undefined when tx metadata does NOT contain %p',
      (key) => {
        // mock a transaction with missing property from metadata
        const invalidTx = JSONBigInt.stringify(
          CardanoTestData.rosenTransactions.validTokenLock
        ).replace(key, key + 'Fake');

        // run the test
        const extractor = new CardanoRosenExtractor(
          CardanoTestData.lockAddress,
          TestUtils.tokens
        );
        const result = extractor.get(invalidTx);

        // check returned value
        expect(result).toBeUndefined();
      }
    );

    /**
     * @target: CardanoRosenExtractor.get should return undefined when metadata does NOT contain '0' key
     * @dependencies:
     * @scenario
     * - mock a transaction with no '0' key in metadata
     * - run the test
     * - check returned value
     * @expected
     * - extractor should return undefined
     */
    it("should return undefined when metadata does NOT contain '0' key", () => {
      // mock a transaction with no '0' key in metadata
      const validTokenLockTx =
        CardanoTestData.rosenTransactions.noZeroKeyMetadata;

      // run the test
      const extractor = new CardanoRosenExtractor(
        CardanoTestData.lockAddress,
        TestUtils.tokens
      );
      const result = extractor.get(JSONBigInt.stringify(validTokenLockTx));

      // check returned value
      expect(result).toBeUndefined();
    });

    /**
     * @target: CardanoRosenExtractor.get should return undefined when transaction does not have metadata
     * @dependencies:
     * @scenario
     * - mock a transaction with no metadata
     * - run the test
     * - check returned value
     * @expected
     * - extractor should return undefined
     */
    it('should return undefined when transaction does not have metadata', () => {
      // mock a transaction with no metadata
      const validTokenLockTx = CardanoTestData.rosenTransactions.noMetadata;

      // run the test
      const extractor = new CardanoRosenExtractor(
        CardanoTestData.lockAddress,
        TestUtils.tokens
      );
      const result = extractor.get(JSONBigInt.stringify(validTokenLockTx));

      // check returned value
      expect(result).toBeUndefined();
    });

    /**
     * @target `CardanoRosenExtractor.get` should return undefined when
     * validateAddress throws error
     * @dependencies
     * @scenario
     * - mock valid rosen data
     * - mock `validateAddress` to throw error
     * - run test
     * - check returned value
     * @expected
     * - to return undefined
     */
    it('should return undefined when validateAddress throws error', () => {
      const validTokenLockTx = CardanoTestData.rosenTransactions.validTokenLock;
      jest.spyOn(addressCodec, 'validateAddress').mockImplementation(() => {
        throw addressCodec.UnsupportedAddressError;
      });

      const extractor = new CardanoRosenExtractor(
        CardanoTestData.lockAddress,
        TestUtils.tokens
      );
      const result = extractor.get(JSONBigInt.stringify(validTokenLockTx));

      expect(result).toBeUndefined();
    });
  });

  describe('getAssetTransformation', () => {
    const toChain = ERGO_CHAIN;

    /**
     * @target: KoiosRosenExtractor.getAssetTransformation should extract asset transformation
     * from token locked UTXO successfully
     * @dependencies:
     * @scenario
     * - mock a UTXO with valid asset transformation
     * - run the test
     * - check returned value
     * @expected
     * - asset transformation should be extracted correctly
     */
    it('should extract asset transformation from token locked UTXO successfully', () => {
      // mock a UTXO with valid asset transformation
      const tokenLockedUtxo = CardanoTestData.rosenUTXOs.tokenLocked;

      // run the test
      const extractor = new CardanoRosenExtractor(
        CardanoTestData.lockAddress,
        TestUtils.tokens
      );
      const result = extractor.getAssetTransformation(tokenLockedUtxo, toChain);

      // check returned value
      expect(result).toStrictEqual(
        CardanoTestData.rosenAssetTransformations.tokenLocked
      );
    });

    /**
     * @target: KoiosRosenExtractor.getAssetTransformation should extract asset transformation
     * from ADA locked UTXO successfully
     * @dependencies:
     * @scenario
     * - mock a UTXO with valid ADA transformation
     * - run the test
     * - check returned value
     * @expected
     * - ADA transformation should be extracted correctly
     */
    it('should extract asset transformation from ADA locked UTXO successfully', () => {
      // mock a UTXO with valid ADA transformation
      const ADALockedUtxo = CardanoTestData.rosenUTXOs.adaLocked;

      // run the test
      const extractor = new CardanoRosenExtractor(
        CardanoTestData.lockAddress,
        TestUtils.tokens
      );
      const result = extractor.getAssetTransformation(ADALockedUtxo, toChain);

      // check returned value
      expect(result).toStrictEqual(
        CardanoTestData.rosenAssetTransformations.adaLocked
      );
    });

    /**
     * @target: KoiosRosenExtractor.getAssetTransformation should extract asset transformation
     * regardless of asset position
     * @dependencies:
     * @scenario
     * - mock a UTXO with valid asset transformation
     * - run the test
     * - check returned value
     * @expected
     * - asset transformation should be extracted correctly
     */
    it('should be able to extract asset transformation regardless of asset position', () => {
      // mock a UTXO with valid asset transformation
      const tokenLockedUtxo = CardanoTestData.rosenUTXOs.secondAssetLocked;

      // run the test
      const extractor = new CardanoRosenExtractor(
        CardanoTestData.lockAddress,
        TestUtils.tokens
      );
      const result = extractor.getAssetTransformation(tokenLockedUtxo, toChain);

      // check returned value
      expect(result).toStrictEqual(
        CardanoTestData.rosenAssetTransformations.tokenLocked
      );
    });

    /**
     * @target: should return ADA transformation when no locked asset is not supported
     * @dependencies:
     * @scenario
     * - mock a UTXO with valid ADA transformation
     * - run the test
     * - check returned value
     * @expected
     * - ADA transformation should be returned
     */
    it('should return ADA transformation when no locked asset is not supported', () => {
      // mock a UTXO with valid asset transformation
      const tokenLockedUtxo = CardanoTestData.rosenUTXOs.wrongTokenLocked;

      // run the test
      const extractor = new CardanoRosenExtractor(
        CardanoTestData.lockAddress,
        TestUtils.tokens
      );
      const result = extractor.getAssetTransformation(tokenLockedUtxo, toChain);

      // check returned value
      expect(result).toStrictEqual(
        CardanoTestData.rosenAssetTransformations.adaLocked
      );
    });

    /**
     * @target: should return undefined when no asset locked and ADA is not supported
     * @dependencies:
     * @scenario
     * - mock a UTXO with valid ADA transformation
     * - run the test
     * - check returned value
     * @expected
     * - extractor should return undefined
     */
    it('should return undefined when no asset locked and ADA is not supported', () => {
      // mock a UTXO with valid ADA transformation
      const tokenLockedUtxo = CardanoTestData.rosenUTXOs.wrongTokenLocked;

      // run the test
      const extractor = new CardanoRosenExtractor(
        CardanoTestData.lockAddress,
        TestUtils.noNativeTokens
      );
      const result = extractor.getAssetTransformation(tokenLockedUtxo, toChain);

      // check returned value
      expect(result).toBeUndefined();
    });

    /**
     * @target: should return undefined when no asset locked and ADA is not supported
     * @dependencies:
     * @scenario
     * - mock a UTXO with valid ADA transformation
     * - run the test
     * - check returned value
     * @expected
     * - extractor should return undefined
     */
    it('should return undefined when ADA is not supported on target chain', () => {
      // mock a UTXO with valid ADA transformation
      const tokenLockedUtxo = CardanoTestData.rosenUTXOs.wrongTokenLocked;

      // run the test
      const extractor = new CardanoRosenExtractor(
        CardanoTestData.lockAddress,
        TestUtils.tokens
      );
      const result = extractor.getAssetTransformation(
        tokenLockedUtxo,
        'not-supported-chain'
      );

      // check returned value
      expect(result).toBeUndefined();
    });
  });
});
