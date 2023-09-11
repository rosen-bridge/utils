import { TestBridgeMinimumFee } from './TestBridgeMinimumFee';
import { JsonBI } from '../lib/parser';
import * as testData from './testData';

describe('BridgeMinimumFee', () => {
  // initialize BridgeMinimumFee
  const bridgeMinimumFee = new TestBridgeMinimumFee('explorerUrl', 'tokenId');
  const explorerApi = bridgeMinimumFee.getExplorer();

  beforeEach(() => {
    // mock explorer client
    const boxes = {
      items: [testData.nativeConfigBox, testData.tokenConfigBox].map((box) =>
        JsonBI.parse(box)
      ),
      total: 2,
    };
    const mockedExplorerApi = jest.spyOn(
      explorerApi.v1,
      'getApiV1BoxesUnspentBytokenidP1'
    );
    mockedExplorerApi.mockResolvedValueOnce(boxes);
    mockedExplorerApi.mockResolvedValue({ items: [], total: boxes.total });
  });

  describe('search', () => {
    /**
     * @target BridgeMinimumFee.search should extract native token fee configs successfully
     * @dependencies
     * - explorerClient
     * @scenario
     * - initialize bridgeMinimumFee object
     * - mock explorer client to return the mocked box when searched for it
     * - run test
     * - check results
     * @xpected
     * - config contains two chains (ergo and cardano)
     * - config contains two heights for each chain
     * - config values for each chain and height are equal to expected values
     */
    it('should extract native token fee configs successfully', async () => {
      // run test
      const result = await bridgeMinimumFee.search('erg');

      // check result
      expect(result).toEqual(testData.nativeTokenFeeConfig);
    });

    /**
     * @target BridgeMinimumFee.search should extract token fee configs successfully
     * @dependencies
     * - explorerClient
     * @scenario
     * - initialize bridgeMinimumFee object
     * - mock explorer client to return the mocked box when searched for it
     * - run test
     * - check results
     * @xpected
     * - config contains two chains (ergo and cardano)
     * - config contains two heights for each chain
     * - config values for each chain and height are equal to expected values
     */
    it('should extract token fee configs successfully', async () => {
      // run test
      const result = await bridgeMinimumFee.search(testData.tokenId);

      // check result
      expect(result).toEqual(testData.tokenFeeConfig);
    });
  });

  describe('getFee', () => {
    /**
     * @target BridgeMinimumFee.getFee should extract native token
     * fee configs for Ergo chain successfully
     * @dependencies
     * - explorerClient
     * @scenario
     * - initialize bridgeMinimumFee object
     * - mock explorer client to return the mocked box when searched for it
     * - run test
     * - check results
     * @xpected
     * - config contains two chains (ergo and cardano)
     * - config contains two heights for each chain
     * - config values for each chain and height are equal to expected values
     */
    it('should extract native token fee configs for Ergo chain successfully', async () => {
      // run test
      const result = await bridgeMinimumFee.getFee('erg', 'ergo', 988000);

      // check result
      const expectedResult = testData.nativeTokenFeeConfig.ergo['988000'];
      expect(result).toEqual(expectedResult);
    });

    /**
     * @target BridgeMinimumFee.getFee should extract token fee configs
     * for Cardano chain successfully
     * @dependencies
     * - explorerClient
     * @scenario
     * - initialize bridgeMinimumFee object
     * - mock explorer client to return the mocked box when searched for it
     * - run test
     * - check results
     * @xpected
     * - config contains two chains (ergo and cardano)
     * - config contains two heights for each chain
     * - config values for each chain and height are equal to expected values
     */
    it('should extract token fee configs for Cardano chain successfully', async () => {
      // run test
      const result = await bridgeMinimumFee.getFee(
        testData.tokenId,
        'cardano',
        8682000
      );

      // check result
      const expectedResult = testData.tokenFeeConfig.cardano['8682000'];
      expect(result).toEqual(expectedResult);
    });
  });
});
