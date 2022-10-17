import { ErgoBox } from 'ergo-lib-wasm-nodejs';
import { TestBridgeMinimumFee } from './TestBridgeMinimumFee';
import { Box, Boxes } from '../lib/explorerApi/types';
import { FeeConfig } from '../lib/bridgeMinimumFee/types';

describe('BridgeMinimumFee', () => {
  /**
   * R4: ["ergo", "cardano"]
   * R5: [["10000", "11000"], ["200000", "210000"]]
   * R6: [["1000000000", "2000000000"], ["3000000", "4000000"]]
   * R7: [["5000000000", "6000000000"], ["7000000", "8000000"]]
   * R8: [["100", "200"], ["300", "400"]]
   */
  const box = ErgoBox.from_json(`{
      "boxId": "b8c0a63ba4ffc3a80410a7d2bd9bd6666676151dbf03223c21229a815ca2015c",
      "value": 100,
      "ergoTree": "0008cd036914ab699d92280efe22b164f2a4e98f52f3c186aac0e5034bf51c09e85d1674",
      "creationHeight": 123414,
      "assets": [],
      "additionalRegisters": {
        "R4": "1a02036572670763617264616e6f",
        "R5": "1d0202a09c01f0ab010280b518a0d119",
        "R6": "1d020280a8d6b90780d0acf30e02809bee0280a4e803",
        "R7": "1d020280c8afa02580f085da2c0280bfd60680c8d007",
        "R8": "1d0202c801900302d804a006"
      },
      "transactionId": "d395de31175c30aacb19af8d678d8573f302be94644bd60df609d10142714fa4",
      "index": 0
    }
  `);

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
      'templateHash',
      'tokenId'
    );
    const explorerApi = bridgeMinimumFee.getExplorer();

    // mock explorer api
    const boxes: Boxes = {
      items: [JSON.parse(box.to_json()) as Box],
      total: 1,
    };
    const mockedExplorerApi = jest.spyOn(explorerApi, 'boxSearch');
    mockedExplorerApi.mockResolvedValue(boxes);

    // run test
    const result = await bridgeMinimumFee.search('target');

    // check result
    const expectedResult: FeeConfig = {
      erg: {
        '10000': {
          bridgeFee: '1000000000',
          networkFee: '5000000000',
          rsnRatio: '100',
        },
        '11000': {
          bridgeFee: '2000000000',
          networkFee: '6000000000',
          rsnRatio: '200',
        },
      },
      cardano: {
        '200000': {
          bridgeFee: '3000000',
          networkFee: '7000000',
          rsnRatio: '300',
        },
        '210000': {
          bridgeFee: '4000000',
          networkFee: '8000000',
          rsnRatio: '400',
        },
      },
    };
    expect(result).toEqual(expectedResult);
  });
});
