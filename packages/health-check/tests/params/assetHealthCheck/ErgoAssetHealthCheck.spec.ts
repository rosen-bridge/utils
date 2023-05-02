import {
  TestErgoExplorerAssetHealthCheck,
  mockExplorerTokenAmount,
  TestErgoNodeAssetHealthCheck,
  mockNodeTokenAmount,
} from './mocked/ErgoAssetHealthCheck.mock';

jest.mock('@rosen-clients/ergo-node');
jest.mock('@rosen-clients/ergo-explorer');

describe('ErgoExplorerAssetHealthCheck', () => {
  describe('update', () => {
    /**
     * @target ErgoExplorerAssetHealthCheck.update Should update the token amount using explorer
     * @dependencies
     * - ergoExplorerClientFactory
     * @scenario
     * - mock return value of explorer token amount
     * - create new instance of ErgoExplorerAssetHealthCheck
     * - update the parameter
     * @expected
     * - The status should update successfully using explorer api
     */
    it('Should update the token amount using explorer', async () => {
      mockExplorerTokenAmount(1200n);
      const assetHealthCheckParam = new TestErgoExplorerAssetHealthCheck(
        'assetId',
        'assetName',
        'address',
        100n,
        10n,
        'url'
      );
      await assetHealthCheckParam.update();
      expect(assetHealthCheckParam.getTokenAmount()).toBe(1200n);
    });
  });
});

describe('ErgoNodeAssetHealthCheck', () => {
  describe('update', () => {
    /**
     * @target ErgoNodeAssetHealthCheck.update Should update the token amount using node
     * @dependencies
     * - ergoNodeClientFactory
     * @scenario
     * - mock return value of node token amount
     * - create new instance of ErgoNodeAssetHealthCheck
     * - update the parameter
     * @expected
     * - The token amount should update successfully using node api
     */
    it('Should update the token amount using node', async () => {
      mockNodeTokenAmount(1200n);
      const assetHealthCheckParam = new TestErgoNodeAssetHealthCheck(
        'assetId',
        'assetName',
        'address',
        100n,
        10n,
        'url'
      );
      await assetHealthCheckParam.update();
      expect(assetHealthCheckParam.getTokenAmount()).toBe(1200n);
    });
  });
});
