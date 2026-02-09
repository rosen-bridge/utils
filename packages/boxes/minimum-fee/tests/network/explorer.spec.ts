import * as testData from '../testData';
import ergoExplorerClientFactory from '@rosen-clients/ergo-explorer';
import { TestMinimumFeeBox } from '../testMinimumFeeBox';
import MinimumFeeExplorerNetwork from '../../lib/network/explorer';

describe('MinimumFeeExplorerNetwork', () => {
  const nativeTokenId = 'erg';
  const tokenId =
    '6cbeec04af6a5047d8818eac2ac6e2b28e1e74a0d339cff96f7641a1a0c3ca9b';
  const defaultMinimumFeeNFT =
    'c597eac4db28f62419eab5639122f2bc4955dfedf958e7cdba5248ba2a81210a';

  describe('getBoxesByTokenId', () => {
    /**
     * mocks `getApiV1BoxesUnspentBytokenidP1` of ergo explorer client
     */
    const mockExplorergetApiV1BoxesUnspentBytokenidP1 = (
      shouldIncludeItemsField = true,
    ) =>
      vi.mocked(ergoExplorerClientFactory).mockReturnValueOnce({
        v1: {
          getApiV1BoxesUnspentBytokenidP1: async (
            tokenId: string,
            {
              offset,
              limit,
            }: {
              offset: bigint;
              limit: bigint;
            },
          ) => ({
            ...(shouldIncludeItemsField && {
              items: testData.explorerTestBoxes.slice(
                Number(offset),
                Number(offset + limit),
              ),
            }),
            total: testData.explorerTestBoxes.length,
          }),
        },
      } as any);

    /**
     * @target MinimumFeeExplorerNetwork.getBoxesByTokenId should fetch and select
     * Erg config box from explorer client successfully
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
    it('should fetch and select Erg config box from explorer client successfully', async () => {
      mockExplorergetApiV1BoxesUnspentBytokenidP1(true);
      const testNetwork = new MinimumFeeExplorerNetwork('');
      const minimumFeeBox = new TestMinimumFeeBox(
        nativeTokenId,
        defaultMinimumFeeNFT,
        testNetwork,
      );
      const res = await minimumFeeBox.fetchBox();
      expect(res).toEqual(true);
      expect(minimumFeeBox.getBox()?.boxId).toEqual(
        '7def746de14a14756002c3dcaf19b3192d9cfb9ecb76c8c48eb7a8f8648675c2',
      );
    });

    /**
     * @target MinimumFeeExplorerNetwork.getBoxesByTokenId should fetch and select
     * token config box from explorer client successfully
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
    it('should fetch and select token config box from explorer client successfully', async () => {
      mockExplorergetApiV1BoxesUnspentBytokenidP1(true);
      const testNetwork = new MinimumFeeExplorerNetwork('');
      const minimumFeeBox = new TestMinimumFeeBox(
        tokenId,
        defaultMinimumFeeNFT,
        testNetwork,
      );
      const res = await minimumFeeBox.fetchBox();
      expect(res).toEqual(true);
      expect(minimumFeeBox.getBox()?.boxId).toEqual(
        'c65fad07c680589c80cddcc6c4a431317c647955aaf0f3ded6f73c42d805466c',
      );
    });
  });
});
