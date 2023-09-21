import { ErgoNetworkType, NotFoundError } from '../lib';
import { TestMinimumFeeBox } from './TestMinimumFeeBox';
import * as testData from './testData';
import ergoExplorerClientFactory from '@rosen-clients/ergo-explorer';
import ergoNodeClientFactory from '@rosen-clients/ergo-node';

jest.mock('@rosen-clients/ergo-explorer');
jest.mock('@rosen-clients/ergo-node');

describe('MinimumFeeBox', () => {
  const nativeTokenId = 'erg';
  const tokenId =
    '6cbeec04af6a5047d8818eac2ac6e2b28e1e74a0d339cff96f7641a1a0c3ca9b';
  const defaultMinimumFeeNFT =
    'c597eac4db28f62419eab5639122f2bc4955dfedf958e7cdba5248ba2a81210a';
  const defaultAddress = '9fsd61VwCBMZaFGctm8q7v59FsS67KusD5yHDhuwQc6KFfFX34U';

  describe('fetchBox', () => {
    /**
     * mocks `getApiV1BoxesUnspentBytokenidP1` of ergo explorer client
     */
    const mockExplorerGetApiV1BoxesUnspentBytokenidP1 = (
      shouldIncludeItemsField = true
    ) =>
      jest.mocked(ergoExplorerClientFactory).mockReturnValueOnce({
        v1: {
          getApiV1BoxesUnspentBytokenidP1: async (
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
      mockExplorerGetApiV1BoxesUnspentBytokenidP1();
      const minimumFeeBox = new TestMinimumFeeBox(
        nativeTokenId,
        defaultMinimumFeeNFT,
        defaultAddress,
        ErgoNetworkType.explorer,
        ''
      );
      await minimumFeeBox.fetchBox();
      const result = minimumFeeBox.getBox();
      expect(result.box_id().to_str()).toEqual(
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
      mockExplorerGetApiV1BoxesUnspentBytokenidP1();
      const minimumFeeBox = new TestMinimumFeeBox(
        tokenId,
        defaultMinimumFeeNFT,
        defaultAddress,
        ErgoNetworkType.explorer,
        ''
      );
      await minimumFeeBox.fetchBox();
      const result = minimumFeeBox.getBox();
      expect(result.box_id().to_str()).toEqual(
        'c65fad07c680589c80cddcc6c4a431317c647955aaf0f3ded6f73c42d805466c'
      );
    });

    /**
     * @target MinimumFeeBox.fetchBox should throw NotFoundError
     * when got no config box from explorer client successfully
     * @dependencies
     * @scenario
     * - mock explorer client to return test boxes
     * - run test & check thrown exception
     * - check returned value
     * @expected
     * - returned box id should be as expected
     */
    it('should throw NotFoundError when got no config box from explorer client successfully', async () => {
      mockExplorerGetApiV1BoxesUnspentBytokenidP1(false);
      const minimumFeeBox = new TestMinimumFeeBox(
        nativeTokenId,
        defaultMinimumFeeNFT,
        defaultAddress,
        ErgoNetworkType.explorer,
        ''
      );
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
      expect(result.box_id().to_str()).toEqual(
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
      expect(result.box_id().to_str()).toEqual(
        'c65fad07c680589c80cddcc6c4a431317c647955aaf0f3ded6f73c42d805466c'
      );
    });

    /**
     * @target MinimumFeeBox.fetchBox should throw NotFoundError
     * when got no config box from node client successfully
     * @dependencies
     * @scenario
     * - mock node client to return test boxes
     * - run test & check thrown exception
     * - check returned value
     * @expected
     * - returned box id should be as expected
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
});
