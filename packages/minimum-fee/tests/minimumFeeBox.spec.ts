import * as wasm from 'ergo-lib-wasm-nodejs';

import {
  ChainMinimumFee,
  FailedError,
  NetworkError,
  NotFoundError,
} from '../lib';
import TestNetwork from './network/testNetwork.mock';
import * as testData from './testData';
import { TestMinimumFeeBox } from './testMinimumFeeBox';

describe('MinimumFeeBox', () => {
  const nativeTokenId = 'erg';
  const tokenId =
    '6cbeec04af6a5047d8818eac2ac6e2b28e1e74a0d339cff96f7641a1a0c3ca9b';
  const defaultMinimumFeeNFT =
    'c597eac4db28f62419eab5639122f2bc4955dfedf958e7cdba5248ba2a81210a';
  const testNetwork = new TestNetwork();

  const generateDefaultMinimumFeeBox = () => {
    const decodeRegister = (register: string) => {
      return wasm.Constant.decode_from_base16(register).to_js();
    };

    return new TestMinimumFeeBox(
      nativeTokenId,
      defaultMinimumFeeNFT,
      testNetwork,
      decodeRegister,
    );
  };

  describe('fetchBox', () => {
    /**
     * @target MinimumFeeBox.fetchBox should fetch and select
     * Erg config box successfully
     * @dependencies
     * @scenario
     * - mock explorer client to return test boxes
     * - run test
     * - check returned value
     * - check object box
     * @expected
     * - it should return true
     * - updated box id should be as expected
     */
    it('should fetch and select Erg config box successfully', async () => {
      vi.spyOn(testNetwork as any, 'getBoxesByTokenId').mockResolvedValueOnce(
        testData.networkTestBoxes,
      );
      const minimumFeeBox = generateDefaultMinimumFeeBox();
      const res = await minimumFeeBox.fetchBox();
      expect(res).toEqual(true);
      expect(minimumFeeBox.getBox()?.boxId).toEqual(
        '7def746de14a14756002c3dcaf19b3192d9cfb9ecb76c8c48eb7a8f8648675c2',
      );
    });

    /**
     * @target MinimumFeeBox.fetchBox should fetch and select
     * token config box successfully
     * @dependencies
     * @scenario
     * - mock explorer client to return test boxes
     * - run test
     * - check returned value
     * - check object box
     * @expected
     * - it should return true
     * - updated box id should be as expected
     */
    it('should fetch and select token config box successfully', async () => {
      vi.spyOn(testNetwork as any, 'getBoxesByTokenId').mockResolvedValueOnce(
        testData.networkTestBoxes,
      );
      const minimumFeeBox = new TestMinimumFeeBox(
        tokenId,
        defaultMinimumFeeNFT,
        testNetwork,
        () => null,
      );
      const res = await minimumFeeBox.fetchBox();
      expect(res).toEqual(true);
      expect(minimumFeeBox.getBox()?.boxId).toEqual(
        'c65fad07c680589c80cddcc6c4a431317c647955aaf0f3ded6f73c42d805466c',
      );
    });

    /**
     * @target MinimumFeeBox.fetchBox should update box to undefined
     * when got no config box
     * @dependencies
     * @scenario
     * - mock explorer client
     * - mock object box with an ErgoBox with normal fee
     * - run test
     * - check returned value
     * - check object box
     * @expected
     * - it should return false
     * - box should be updated to undefined
     */
    it('should update box to undefined when got no config box', async () => {
      vi.spyOn(testNetwork as any, 'getBoxesByTokenId').mockResolvedValueOnce(
        [],
      );
      const minimumFeeBox = generateDefaultMinimumFeeBox();
      minimumFeeBox.setBox(testData.normalFeeBox);
      const res = await minimumFeeBox.fetchBox();
      expect(res).toEqual(false);
      expect(minimumFeeBox.getBox()).toBeUndefined();
    });

    /**
     * @target MinimumFeeBox.fetchBox should update box to undefined
     * when received FailedError while fetching or selecting the box
     * @dependencies
     * @scenario
     * - mock explorer client
     * - mock object box with an ErgoBox with normal fee
     * - mock `fetchBoxesUsingExplorer` to throw FailedError
     * - run test
     * - check returned value
     * - check object box
     * @expected
     * - it should return false
     * - box should be updated to undefined
     */
    it('should update box to undefined when received FailedError while fetching or selecting the box', async () => {
      const minimumFeeBox = generateDefaultMinimumFeeBox();
      vi.spyOn(testNetwork as any, 'getBoxesByTokenId').mockRejectedValueOnce(
        new FailedError(`test FailedError`),
      );
      minimumFeeBox.setBox(testData.normalFeeBox);
      const res = await minimumFeeBox.fetchBox();
      expect(res).toEqual(false);
      expect(minimumFeeBox.getBox()).toBeUndefined();
    });

    /**
     * @target MinimumFeeBox.fetchBox should not update the box
     * when received NetworkError while fetching the box
     * @dependencies
     * @scenario
     * - mock explorer client
     * - mock object box with an ErgoBox with normal fee
     * - mock `fetchBoxesUsingExplorer` to throw NetworkError
     * - run test
     * - check returned value
     * - check object box
     * @expected
     * - it should return false
     * - box should be updated to undefined
     */
    it('should not update the box when received NetworkError while fetching the box', async () => {
      const minimumFeeBox = generateDefaultMinimumFeeBox();
      vi.spyOn(testNetwork as any, 'getBoxesByTokenId').mockRejectedValueOnce(
        new NetworkError(`test NetworkError`),
      );
      minimumFeeBox.setBox(testData.normalFeeBox);
      const res = await minimumFeeBox.fetchBox();
      expect(res).toEqual(false);
      expect(minimumFeeBox.getBox()).toBeDefined();
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
      const minimumFeeBox = generateDefaultMinimumFeeBox();
      expect(() => {
        minimumFeeBox.callSelectEligibleBox(
          testData.networkTestBoxesMultipleConfig,
        );
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
      minimumFeeBox.setBox(testData.normalFeeBox);
      const result = minimumFeeBox.getFee('ergo', 12000, 'cardano');
      expect(result).toEqual(
        new ChainMinimumFee(testData.normalFee[0].configs.cardano),
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
      minimumFeeBox.setBox(testData.newChainFeeBox);
      const result = minimumFeeBox.getFee('ergo', 23000, 'cardano');
      expect(result).toEqual(
        new ChainMinimumFee(testData.newChainFee[1].configs.cardano),
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
      minimumFeeBox.setBox(testData.removeChainFeeBox);
      const result = minimumFeeBox.getFee('ergo', 12000, 'cardano');
      expect(result).toEqual(
        new ChainMinimumFee(testData.removeChainFee[0].configs.cardano),
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
      minimumFeeBox.setBox(testData.normalFeeBox);
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
      minimumFeeBox.setBox(testData.normalFeeBox);
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
      minimumFeeBox.setBox(testData.normalFeeBox);
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
});
