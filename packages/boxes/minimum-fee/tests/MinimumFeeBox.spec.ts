import { ErgoBox } from 'ergo-lib-wasm-nodejs';
import {
  ChainMinimumFee,
  ErgoNetworkType,
  FailedError,
  InvalidConfig,
  NotFoundError,
} from '../lib';
import { TestMinimumFeeBox } from './TestMinimumFeeBox';
import * as testData from './testData';
import ergoExplorerClientFactory from '@rosen-clients/ergo-explorer';
import ergoNodeClientFactory from '@rosen-clients/ergo-node';
import JsonBigInt from '@rosen-bridge/json-bigint';

jest.mock('@rosen-clients/ergo-explorer');
jest.mock('@rosen-clients/ergo-node');

describe('MinimumFeeBox', () => {
  const nativeTokenId = 'erg';
  const tokenId =
    '6cbeec04af6a5047d8818eac2ac6e2b28e1e74a0d339cff96f7641a1a0c3ca9b';
  const defaultMinimumFeeNFT =
    'c597eac4db28f62419eab5639122f2bc4955dfedf958e7cdba5248ba2a81210a';
  const defaultAddress = '9fsd61VwCBMZaFGctm8q7v59FsS67KusD5yHDhuwQc6KFfFX34U';

  const generateDefaultMinimumFeeBox = () =>
    new TestMinimumFeeBox(
      nativeTokenId,
      defaultMinimumFeeNFT,
      defaultAddress,
      ErgoNetworkType.explorer,
      ''
    );

  describe('fetchBox', () => {
    /**
     * mocks `getApiV1BoxesUnspentByaddressP1` of ergo explorer client
     */
    const mockExplorerGetApiV1BoxesUnspentByaddressP1 = (
      shouldIncludeItemsField = true
    ) =>
      jest.mocked(ergoExplorerClientFactory).mockReturnValueOnce({
        v1: {
          getApiV1BoxesUnspentByaddressP1: async (
            address: string,
            {
              offset,
              limit,
            }: {
              offset: bigint;
              limit: bigint;
            }
          ) => ({
            ...(shouldIncludeItemsField && {
              items: testData.explorerTestBoxes.slice(
                Number(offset),
                Number(offset + limit)
              ),
            }),
            total: testData.explorerTestBoxes.length,
          }),
        },
      } as any);

    /**
     * mocks `getBoxesByAddressUnspent` of ergo node client
     */
    const mockNodeGetBoxesByAddressUnspent = () =>
      jest.mocked(ergoNodeClientFactory).mockReturnValueOnce({
        getBoxesByAddressUnspent: async (
          address: string,
          { offset, limit }: { offset: number; limit: number }
        ) =>
          testData.nodeTestBoxes.slice(Number(offset), Number(offset + limit)),
      } as any);

    /**
     * mocks `getBoxesByAddressUnspent` of ergo node client to throw error with status 400
     */
    const mockNodeGetBoxesByAddressUnspentToThrow = () =>
      jest.mocked(ergoNodeClientFactory).mockReturnValueOnce({
        getBoxesByAddressUnspent: jest.fn().mockRejectedValueOnce({
          response: {
            status: 400,
          },
        }),
      } as any);

    /**
     * @target MinimumFeeBox.fetchBox should fetch and select
     * Erg config box from explorer client successfully
     * @dependencies
     * @scenario
     * - mock explorer client to return test boxes
     * - run test
     * - check returned value
     * @expected
     * - returned box id should be as expected
     */
    it('should fetch and select Erg config box from explorer client successfully', async () => {
      mockExplorerGetApiV1BoxesUnspentByaddressP1();
      const minimumFeeBox = generateDefaultMinimumFeeBox();
      await minimumFeeBox.fetchBox();
      const result = minimumFeeBox.getBox();
      expect(result?.box_id().to_str()).toEqual(
        '7def746de14a14756002c3dcaf19b3192d9cfb9ecb76c8c48eb7a8f8648675c2'
      );
    });

    /**
     * @target MinimumFeeBox.fetchBox should fetch and select
     * token config box from explorer client successfully
     * @dependencies
     * @scenario
     * - mock explorer client to return test boxes
     * - run test
     * - check returned value
     * @expected
     * - returned box id should be as expected
     */
    it('should fetch and select token config box from explorer client successfully', async () => {
      mockExplorerGetApiV1BoxesUnspentByaddressP1();
      const minimumFeeBox = new TestMinimumFeeBox(
        tokenId,
        defaultMinimumFeeNFT,
        defaultAddress,
        ErgoNetworkType.explorer,
        ''
      );
      await minimumFeeBox.fetchBox();
      const result = minimumFeeBox.getBox();
      expect(result?.box_id().to_str()).toEqual(
        'c65fad07c680589c80cddcc6c4a431317c647955aaf0f3ded6f73c42d805466c'
      );
    });

    /**
     * @target MinimumFeeBox.fetchBox should throw NotFoundError
     * when got no config box from explorer client
     * @dependencies
     * @scenario
     * - mock explorer client to return test boxes
     * - run test & check thrown exception
     * @expected
     * - NotFoundError should be thrown
     */
    it('should throw NotFoundError when got no config box from explorer client successfully', async () => {
      mockExplorerGetApiV1BoxesUnspentByaddressP1(false);
      const minimumFeeBox = generateDefaultMinimumFeeBox();
      await expect(async () => {
        await minimumFeeBox.fetchBox();
      }).rejects.toThrow(NotFoundError);
    });

    /**
     * @target MinimumFeeBox.fetchBox should fetch and select
     * Erg config box from node client successfully
     * @dependencies
     * @scenario
     * - mock node client to return test boxes
     * - run test
     * - check returned value
     * @expected
     * - returned box id should be as expected
     */
    it('should fetch and select Erg config box from node client successfully', async () => {
      mockNodeGetBoxesByAddressUnspent();
      const minimumFeeBox = new TestMinimumFeeBox(
        nativeTokenId,
        defaultMinimumFeeNFT,
        defaultAddress,
        ErgoNetworkType.node,
        ''
      );
      await minimumFeeBox.fetchBox();
      const result = minimumFeeBox.getBox();
      expect(result?.box_id().to_str()).toEqual(
        '7def746de14a14756002c3dcaf19b3192d9cfb9ecb76c8c48eb7a8f8648675c2'
      );
    });

    /**
     * @target MinimumFeeBox.fetchBox should fetch and select
     * token config box from node client successfully
     * @dependencies
     * @scenario
     * - mock node client to return test boxes
     * - run test
     * - check returned value
     * @expected
     * - returned box id should be as expected
     */
    it('should fetch and select token config box from node client successfully', async () => {
      mockNodeGetBoxesByAddressUnspent();
      const minimumFeeBox = new TestMinimumFeeBox(
        tokenId,
        defaultMinimumFeeNFT,
        defaultAddress,
        ErgoNetworkType.node,
        ''
      );
      await minimumFeeBox.fetchBox();
      const result = minimumFeeBox.getBox();
      expect(result?.box_id().to_str()).toEqual(
        'c65fad07c680589c80cddcc6c4a431317c647955aaf0f3ded6f73c42d805466c'
      );
    });

    /**
     * @target MinimumFeeBox.fetchBox should throw NotFoundError
     * when got no config box from node client
     * @dependencies
     * @scenario
     * - mock node client to return test boxes
     * - run test & check thrown exception
     * @expected
     * - NotFoundError should be thrown
     */
    it('should throw NotFoundError when got no config box from node client successfully', async () => {
      mockNodeGetBoxesByAddressUnspentToThrow();
      const minimumFeeBox = new TestMinimumFeeBox(
        nativeTokenId,
        defaultMinimumFeeNFT,
        defaultAddress,
        ErgoNetworkType.node,
        ''
      );
      await expect(async () => {
        await minimumFeeBox.fetchBox();
      }).rejects.toThrow(NotFoundError);
    });
  });

  describe('selectEligibleBox', () => {
    /**
     * @target MinimumFeeBox.fetchBox should throw FailedError
     * when found multiple config box
     * @dependencies
     * @scenario
     * - mock test boxes
     * - run test & check thrown exception
     * @expected
     * - FailedError should be thrown
     */
    it('should throw FailedError when found multiple config box', async () => {
      const testBoxes = testData.nodeTestBoxes.map((boxJson) =>
        ErgoBox.from_json(JsonBigInt.stringify(boxJson))
      );
      const minimumFeeBox = generateDefaultMinimumFeeBox();
      expect(() => {
        minimumFeeBox.callSelectEligibleBox(testBoxes);
      }).toThrow(FailedError);
    });
  });

  describe('getFee', () => {
    /**
     * @target MinimumFeeBox.getFee should extract normal fee successfully
     * @dependencies
     * @scenario
     * - mock object box with an ErgoBox with normal fee
     * - run test
     * - check returned value
     * @expected
     * - returned config should be as expected
     */
    it('should extract normal fee successfully', () => {
      const minimumFeeBox = generateDefaultMinimumFeeBox();
      minimumFeeBox.setBox(ErgoBox.from_json(testData.normalFeeBox));
      const result = minimumFeeBox.getFee('ergo', 12000, 'cardano');
      expect(result).toEqual(
        new ChainMinimumFee(testData.normalFee[0].configs.cardano)
      );
    });

    /**
     * @target MinimumFeeBox.getFee should extract the fee
     * that adds a new chain successfully
     * @dependencies
     * @scenario
     * - mock object box with an ErgoBox containing the fee with a new chain
     * - run test
     * - check returned value
     * @expected
     * - returned config should be as expected
     */
    it('should extract the fee that adds a new chain successfully', () => {
      const minimumFeeBox = generateDefaultMinimumFeeBox();
      minimumFeeBox.setBox(ErgoBox.from_json(testData.newChainFeeBox));
      const result = minimumFeeBox.getFee('ergo', 23000, 'cardano');
      expect(result).toEqual(
        new ChainMinimumFee(testData.newChainFee[1].configs.cardano)
      );
    });

    /**
     * @target MinimumFeeBox.getFee should extract the fee
     * that removes a chain successfully
     * @dependencies
     * @scenario
     * - mock object box with an ErgoBox containing the fee without a previous chain
     * - run test
     * - check returned value
     * @expected
     * - returned config should be as expected
     */
    it('should extract the fee that removes a chain successfully', () => {
      const minimumFeeBox = generateDefaultMinimumFeeBox();
      minimumFeeBox.setBox(ErgoBox.from_json(testData.removeChainFeeBox));
      const result = minimumFeeBox.getFee('ergo', 12000, 'cardano');
      expect(result).toEqual(
        new ChainMinimumFee(testData.removeChainFee[0].configs.cardano)
      );
    });

    /**
     * @target MinimumFeeBox.getFee should throw error
     * when fromChain is not supported
     * @dependencies
     * @scenario
     * - mock object box with an ErgoBox with normal fee
     * - run test & check thrown exception
     * @expected
     * - NotFoundError should be thrown
     */
    it('should throw error when fromChain is not supported', () => {
      const minimumFeeBox = generateDefaultMinimumFeeBox();
      minimumFeeBox.setBox(ErgoBox.from_json(testData.normalFeeBox));
      expect(() => {
        minimumFeeBox.getFee('notSupportedChain', 12000, 'cardano');
      }).toThrow(NotFoundError);
    });

    /**
     * @target MinimumFeeBox.getFee should throw error
     * when toChain is not supported
     * @dependencies
     * @scenario
     * - mock object box with an ErgoBox with normal fee
     * - run test & check thrown exception
     * @expected
     * - Error should be thrown
     */
    it('should throw error when toChain is not supported', () => {
      const minimumFeeBox = generateDefaultMinimumFeeBox();
      minimumFeeBox.setBox(ErgoBox.from_json(testData.normalFeeBox));
      expect(() => {
        minimumFeeBox.getFee('ergo', 12000, 'notSupporetedChain');
      }).toThrow(Error);
    });

    /**
     * @target MinimumFeeBox.getFee should throw error
     * when given height of fromChain is not supported
     * @dependencies
     * @scenario
     * - mock object box with an ErgoBox with normal fee
     * - run test & check thrown exception
     * @expected
     * - NotFoundError should be thrown
     */
    it('should throw error when given height of fromChain is not supported', () => {
      const minimumFeeBox = generateDefaultMinimumFeeBox();
      minimumFeeBox.setBox(ErgoBox.from_json(testData.normalFeeBox));
      expect(() => {
        minimumFeeBox.getFee('ergo', 10000, 'cardano');
      }).toThrow(NotFoundError);
    });

    /**
     * @target MinimumFeeBox.getFee should throw error
     * when box is not fetched yet
     * @dependencies
     * @scenario
     * - run test & check thrown exception
     * @expected
     * - Error should be thrown
     */
    it('should throw error when box is not fetched yet', () => {
      const minimumFeeBox = generateDefaultMinimumFeeBox();
      expect(() => {
        minimumFeeBox.getFee('ergo', 12000, 'cardano');
      }).toThrow(Error);
    });
  });

  describe('toBuilder', () => {
    /**
     * @target MinimumFeeBox.toBuilder should return a builder
     * with the same parameters
     * @dependencies
     * @scenario
     * - mock object box with an ErgoBox with normal fee
     * - run test
     * - set height for returned value and build it
     * - check box parameters
     * @expected
     * - box parameters should be identical
     *   - value
     *   - address
     *   - tokens
     *   - registers
     */
    it('should return a builder with the same parameters', () => {
      const minimumFeeBox = generateDefaultMinimumFeeBox();
      const testBox = ErgoBox.from_json(testData.tokenNormalFeeBox);
      minimumFeeBox.setBox(testBox);
      const result = minimumFeeBox.toBuilder();
      result.setHeight(1000000);
      const resultBoxCandidate = result.build();

      expect(resultBoxCandidate.value().as_i64().to_str()).toEqual(
        testBox.value().as_i64().to_str()
      );
      expect(resultBoxCandidate.ergo_tree().to_base16_bytes()).toEqual(
        testBox.ergo_tree().to_base16_bytes()
      );
      expect(resultBoxCandidate.tokens().len()).toEqual(
        resultBoxCandidate.tokens().len()
      );
      for (let i = 0; i < resultBoxCandidate.tokens().len(); i++) {
        expect(resultBoxCandidate.tokens().get(i).id().to_str()).toEqual(
          testBox.tokens().get(i).id().to_str()
        );
        expect(
          resultBoxCandidate.tokens().get(i).amount().as_i64().to_str()
        ).toEqual(testBox.tokens().get(i).amount().as_i64().to_str());
      }

      expect(
        resultBoxCandidate
          .register_value(4)
          ?.to_coll_coll_byte()
          .map((element) => Buffer.from(element).toString())
      ).toEqual(
        testBox
          .register_value(4)
          ?.to_coll_coll_byte()
          .map((element) => Buffer.from(element).toString())
      );
      for (let i = 5; i < 10; i++) {
        expect(resultBoxCandidate.register_value(i)?.to_js()).toEqual(
          testBox.register_value(i)?.to_js()
        );
      }
    });

    /**
     * @target MinimumFeeBox.toBuilder should return a builder
     * with the same parameters with a config that removes a chain
     * @dependencies
     * @scenario
     * - mock object box with an ErgoBox with remove chain fee
     * - run test
     * - set height for returned value and build it
     * - check box parameters
     * @expected
     * - box parameters should be identical
     *   - value
     *   - address
     *   - tokens
     *   - registers
     */
    it('should return a builder with the same parameters with a config that removes a chain', () => {
      const minimumFeeBox = generateDefaultMinimumFeeBox();
      const testBox = ErgoBox.from_json(testData.removeChainFeeBox);
      minimumFeeBox.setBox(testBox);
      const result = minimumFeeBox.toBuilder();
      result.setHeight(1000000);
      const resultBoxCandidate = result.build();

      expect(resultBoxCandidate.value().as_i64().to_str()).toEqual(
        testBox.value().as_i64().to_str()
      );
      expect(resultBoxCandidate.ergo_tree().to_base16_bytes()).toEqual(
        testBox.ergo_tree().to_base16_bytes()
      );
      expect(resultBoxCandidate.tokens().len()).toEqual(
        resultBoxCandidate.tokens().len()
      );
      for (let i = 0; i < resultBoxCandidate.tokens().len(); i++) {
        expect(resultBoxCandidate.tokens().get(i).id().to_str()).toEqual(
          testBox.tokens().get(i).id().to_str()
        );
        expect(
          resultBoxCandidate.tokens().get(i).amount().as_i64().to_str()
        ).toEqual(testBox.tokens().get(i).amount().as_i64().to_str());
      }

      expect(
        resultBoxCandidate
          .register_value(4)
          ?.to_coll_coll_byte()
          .map((element) => Buffer.from(element).toString())
      ).toEqual(
        testBox
          .register_value(4)
          ?.to_coll_coll_byte()
          .map((element) => Buffer.from(element).toString())
      );
      for (let i = 5; i < 10; i++) {
        expect(resultBoxCandidate.register_value(i)?.to_js()).toEqual(
          testBox.register_value(i)?.to_js()
        );
      }
    });

    /**
     * @target MinimumFeeBox.toBuilder should not set height
     * for builder
     * @dependencies
     * @scenario
     * - mock object box with an ErgoBox with normal fee
     * - run test
     * - check returned value
     * @expected
     * - height of returned builder should be undefined
     */
    it('should not set height for builder', () => {
      const minimumFeeBox = generateDefaultMinimumFeeBox();
      minimumFeeBox.setBox(ErgoBox.from_json(testData.normalFeeBox));
      const result = minimumFeeBox.toBuilder();
      expect((result as any).height).toBeUndefined();
    });
  });
});
