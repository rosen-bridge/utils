import { ErgoAssetHealthCheckParam } from '../../lib';
import { ErgoNetworkType } from '../../lib/types';
import {
  mockNodeTokenAmount,
  mockExplorerTokenAmount,
} from './mocked/ErgoAssetHealthCheck.mock';

jest.mock('@rosen-clients/ergo-node');
jest.mock('@rosen-clients/ergo-explorer');

describe('ErgoAssetHealthCheck', () => {
  describe('update', () => {
    /**
     * @target ErgoAssetHealthCheck.update Should update the token amount using node
     * @dependencies
     * - ergoNodeClientFactory
     * @scenario
     * - mock return value of node token amount
     * - create new instance of ErgoAssetHealthCheck
     * - update the parameter
     * @expected
     * - The token amount should update successfully using node api
     */
    it('Should update the token amount using node', async () => {
      mockNodeTokenAmount(1200n);
      const assetHealthCheckParam = new ErgoAssetHealthCheckParam(
        'assetId',
        'assetName',
        'address',
        100n,
        10n,
        'url',
        ErgoNetworkType.NODE
      );
      await assetHealthCheckParam.update();
      expect(assetHealthCheckParam.tokenAmount).toBe(1200n);
    });

    /**
     * @target ErgoAssetHealthCheck.update Should update the token amount using explorer
     * @dependencies
     * - ergoExplorerClientFactory
     * @scenario
     * - mock return value of explorer token amount
     * - create new instance of ErgoAssetHealthCheck
     * - update the parameter
     * @expected
     * - The status should update successfully using explorer api
     */
    it('Should update the token amount using explorer', async () => {
      mockExplorerTokenAmount(1200n);
      const assetHealthCheckParam = new ErgoAssetHealthCheckParam(
        'assetId',
        'assetName',
        'address',
        100n,
        10n,
        'url',
        ErgoNetworkType.EXPLORER
      );
      await assetHealthCheckParam.update();
      expect(assetHealthCheckParam.tokenAmount).toBe(1200n);
    });
  });
});
