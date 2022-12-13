import { ErgoBox } from 'ergo-lib-wasm-nodejs';
import { TestBridgeMinimumFee } from './TestBridgeMinimumFee';
import { Box, Boxes } from '../lib/network/types';
import { Fee, FeeConfig } from '../lib';

describe('BridgeMinimumFee', () => {
  /**
   * R4: ["ergo", "cardano"]
   * R5 [ [ "865425" ], [ "7963300"] ]
   * R6 [ [ "200000000" ], [ "30000000" ] ]
   * R7 [ [ "1000000" ], [ "2000000" ] ]
   * R8 [ [ "10" ], [ "10" ] ]
   */
  const nativeConfigBox = ErgoBox.from_json(`{
      "boxId": "13845af55e7f7cdf72041de62305216c8b47bbeab74502829577ed5e28c9dfc3",
      "value": 100000000,
      "ergoTree": "0008cd0234672904c00272eec4dcf291d08fe9d0eb21c43317a3b520b6886a2eb6151887",
      "creationHeight": 885245,
      "assets": [{
        "tokenId": "febf2d60bbcccb94ed27f49f496521415280bb7b59086455371808c4f740f36a",
        "amount": 1
      }],
      "additionalRegisters": {
        "R4": "1a02046572676f0763617264616e6f",
        "R5": "1d0201a2d26901c88acc07",
        "R6": "1d02018088debe0101808ece1c",
        "R7": "1d020180897a018092f401",
        "R8": "1d0201140114"
      },
      "transactionId": "bd65ff8629bfeaeea46c19a9f2f7ffe283c11b73a3dba62bfc6aa64a1d3adbca",
      "index": 2
    }
  `);

  /**
   * R4: ["ergo", "cardano"]
   * R5 [ [ "865425" ], [ "7963300"] ]
   * R6 [ [ "2000" ], [ "3000" ] ]
   * R7 [ [ "200" ], [ "300" ] ]
   * R8 [ [ "100000" ], [ "100000" ] ]
   */
  const tokenConfigBox = ErgoBox.from_json(`{
      "boxId": "1680cb05e6475a2c58c6b8aa6d8d4d460f37fec8164caed73449a2d68e9fad6d",
      "value": 99000000,
      "ergoTree": "0008cd0234672904c00272eec4dcf291d08fe9d0eb21c43317a3b520b6886a2eb6151887",
      "creationHeight": 885245,
      "assets": [
        {
          "tokenId": "febf2d60bbcccb94ed27f49f496521415280bb7b59086455371808c4f740f36a",
          "amount": 1
        },
        {
          "tokenId": "517c91b4ea680166ddd3f67b27b0274c20bbd2aeb82b60eaf5bf5471b37f684a",
          "amount": 1
        }
      ],
      "additionalRegisters": {
        "R4": "1a02046572676f0763617264616e6f",
        "R5": "1d0201a2d26901c88acc07",
        "R6": "1d0201a01f01f02e",
        "R7": "1d0201900301d804",
        "R8": "1d0201c09a0c01c09a0c"
      },
      "transactionId": "bd65ff8629bfeaeea46c19a9f2f7ffe283c11b73a3dba62bfc6aa64a1d3adbca",
      "index": 0
      }
  `);
  const tokenId =
    '517c91b4ea680166ddd3f67b27b0274c20bbd2aeb82b60eaf5bf5471b37f684a';

  // mock explorer api
  const boxes: Boxes = {
    items: [
      JSON.parse(nativeConfigBox.to_json()) as Box,
      JSON.parse(tokenConfigBox.to_json()) as Box,
    ],
    total: 2,
  };

  describe('searchNative', () => {
    /**
     * Target: BridgeMinimumFee.search
     * Dependencies:
     *    ExplorerAPI
     * Scenario:
     *    Initialize bridgeMinimumFee object
     *    Mock explorer api to return the mocked box when searched for it
     *    Run test
     *    Check results
     * Expected Output:
     *    Config contains two chains (ergo and cardano)
     *    Config contains two heights for each chain
     *    Config values for each chain and height are equal to expected values
     */
    it('should extract fee configs successfully', async () => {
      // initialize BridgeMinimumFee
      const bridgeMinimumFee = new TestBridgeMinimumFee(
        'explorerUrl',
        'tokenId'
      );
      const explorerApi = bridgeMinimumFee.getExplorer();

      const mockedExplorerApi = jest.spyOn(explorerApi, 'searchBoxByTokenId');
      mockedExplorerApi.mockResolvedValue(boxes);

      // run test
      const result = await bridgeMinimumFee.search('erg');

      // check result
      const expectedResult: FeeConfig = {
        ergo: {
          '865425': {
            bridgeFee: BigInt('200000000'),
            networkFee: BigInt('1000000'),
            rsnRatio: BigInt('10'),
          },
        },
        cardano: {
          '7963300': {
            bridgeFee: BigInt('30000000'),
            networkFee: BigInt('2000000'),
            rsnRatio: BigInt('10'),
          },
        },
      };
      expect(result).toEqual(expectedResult);
    });
  });

  describe('searchToken', () => {
    /**
     * Target: BridgeMinimumFee.search
     * Dependencies:
     *    ExplorerAPI
     * Scenario:
     *    Initialize bridgeMinimumFee object
     *    Mock explorer api to return the mocked box when searched for it
     *    Run test
     *    Check results
     * Expected Output:
     *    Config contains two chains (ergo and cardano)
     *    Config contains two heights for each chain
     *    Config values for each chain and height are equal to expected values
     */
    it('should extract fee configs successfully', async () => {
      // initialize BridgeMinimumFee
      const bridgeMinimumFee = new TestBridgeMinimumFee(
        'explorerUrl',
        'tokenId'
      );
      const explorerApi = bridgeMinimumFee.getExplorer();

      const mockedExplorerApi = jest.spyOn(explorerApi, 'searchBoxByTokenId');
      mockedExplorerApi.mockResolvedValue(boxes);

      // run test
      const result = await bridgeMinimumFee.search(tokenId);

      // check result
      const expectedResult: FeeConfig = {
        ergo: {
          '865425': {
            bridgeFee: BigInt('2000'),
            networkFee: BigInt('200'),
            rsnRatio: BigInt('100000'),
          },
        },
        cardano: {
          '7963300': {
            bridgeFee: BigInt('3000'),
            networkFee: BigInt('300'),
            rsnRatio: BigInt('100000'),
          },
        },
      };
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getFeeNative', () => {
    /**
     * Target: BridgeMinimumFee.getFee
     * Dependencies:
     *    ExplorerAPI
     * Scenario:
     *    Initialize bridgeMinimumFee object
     *    Mock explorer api to return the mocked box when searched for it
     *    Run test
     *    Check results
     * Expected Output:
     *    Config values are equal to expected values
     */
    it('should extract fee configs successfully', async () => {
      // initialize BridgeMinimumFee
      const bridgeMinimumFee = new TestBridgeMinimumFee(
        'explorerUrl',
        'tokenId'
      );
      const explorerApi = bridgeMinimumFee.getExplorer();

      const mockedExplorerApi = jest.spyOn(explorerApi, 'searchBoxByTokenId');
      mockedExplorerApi.mockResolvedValue(boxes);

      // run test
      const result = await bridgeMinimumFee.getFee('erg', 'ergo', 865999);

      // check result
      const expectedResult: Fee = {
        bridgeFee: BigInt('200000000'),
        networkFee: BigInt('1000000'),
        rsnRatio: BigInt('10'),
      };
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getFeeToken', () => {
    /**
     * Target: BridgeMinimumFee.getFee
     * Dependencies:
     *    ExplorerAPI
     * Scenario:
     *    Initialize bridgeMinimumFee object
     *    Mock explorer api to return the mocked box when searched for it
     *    Run test
     *    Check results
     * Expected Output:
     *    Config values are equal to expected values
     */
    it('should extract fee configs successfully', async () => {
      // initialize BridgeMinimumFee
      const bridgeMinimumFee = new TestBridgeMinimumFee(
        'explorerUrl',
        'tokenId'
      );
      const explorerApi = bridgeMinimumFee.getExplorer();

      const mockedExplorerApi = jest.spyOn(explorerApi, 'searchBoxByTokenId');
      mockedExplorerApi.mockResolvedValue(boxes);

      // run test
      const result = await bridgeMinimumFee.getFee(tokenId, 'cardano', 7963999);

      // check result
      const expectedResult: Fee = {
        bridgeFee: BigInt('3000'),
        networkFee: BigInt('300'),
        rsnRatio: BigInt('100000'),
      };
      expect(result).toEqual(expectedResult);
    });
  });
});
