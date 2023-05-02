import {
  ErgoAssetHealthCheckParam,
  ErgoNetworkType,
  HealthStatusLevel,
} from '../../lib';
import {
  mockNodeTokenAmount,
  mockExplorerTokenAmount,
} from './mocked/ErgoAssetHealthCheck.mock';

jest.mock('@rosen-clients/ergo-node');
jest.mock('@rosen-clients/ergo-explorer');

describe('ErgoAssetHealthCheck', () => {
  describe('update', () => {
    /**
     * @target ErgoAssetHealthCheck.update Should update the status to healthy
     * @dependencies
     * - ergoNodeClientFactory
     * @scenario
     * - mock return value of node token amount to more than sufficient
     * - create new instance of ErgoAssetHealthCheck
     * - update the status
     * - check the status
     * @expected
     * - The status should update successfully using node api
     */
    it('Should update the status to healthy', async () => {
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
      const healthStatus = await assetHealthCheckParam.getHealthStatus();

      expect(healthStatus).toBe(HealthStatusLevel.HEALTHY);
    });

    /**
     * @target ErgoAssetHealthCheck.update Should update the status to unstable
     * @dependencies
     * - ergoNodeClientFactory
     * @scenario
     * - mock return value of node token amount to less than warning threshold
     * - create new instance of ErgoAssetHealthCheck
     * - update the status
     * - check the status
     * @expected
     * - The status should update successfully using node api
     */
    it('Should update the status to unstable', async () => {
      mockNodeTokenAmount(90n);
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
      const healthStatus = await assetHealthCheckParam.getHealthStatus();

      expect(healthStatus).toBe(HealthStatusLevel.UNSTABLE);
    });

    /**
     * @target ErgoAssetHealthCheck.update Should update the status to broken
     * @dependencies
     * - ergoNodeClientFactory
     * @scenario
     * - mock return value of node token amount to less than critical threshold
     * - create new instance of ErgoAssetHealthCheck
     * - update the status
     * - check the status
     * @expected
     * - The status should update successfully using node api
     */
    it('Should update the status to broken', async () => {
      mockNodeTokenAmount(9n);
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
      const healthStatus = await assetHealthCheckParam.getHealthStatus();

      expect(healthStatus).toBe(HealthStatusLevel.BROKEN);
    });

    /**
     * @target ErgoAssetHealthCheck.update Should update the status to healthy
     * @dependencies
     * - ergoExplorerClientFactory
     * @scenario
     * - mock return value of node token amount to more than sufficient
     * - create new instance of ErgoAssetHealthCheck
     * - update the status
     * - check the status
     * @expected
     * - The status should update successfully using explorer api
     */
    it('Should update the status to healthy', async () => {
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
      const healthStatus = await assetHealthCheckParam.getHealthStatus();

      expect(healthStatus).toBe(HealthStatusLevel.HEALTHY);
    });

    /**
     * @target ErgoAssetHealthCheck.update Should update the status to unstable
     * @dependencies
     * - ergoExplorerClientFactory
     * @scenario
     * - mock return value of node token amount to less than warning threshold
     * - create new instance of ErgoAssetHealthCheck
     * - update the status
     * - check the status
     * @expected
     * - The status should update successfully using explorer api
     */
    it('Should update the status to unstable', async () => {
      mockExplorerTokenAmount(90n);
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
      const healthStatus = await assetHealthCheckParam.getHealthStatus();

      expect(healthStatus).toBe(HealthStatusLevel.UNSTABLE);
    });

    /**
     * @target ErgoAssetHealthCheck.update Should update the status to broken
     * @dependencies
     * - ergoExplorerClientFactory
     * @scenario
     * - mock return value of node token amount to less than critical threshold
     * - create new instance of ErgoAssetHealthCheck
     * - update the status
     * - check the status
     * @expected
     * - The status should update successfully using explorer api
     */
    it('Should update the status to broken', async () => {
      mockExplorerTokenAmount(9n);
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
      const healthStatus = await assetHealthCheckParam.getHealthStatus();

      expect(healthStatus).toBe(HealthStatusLevel.BROKEN);
    });
  });
});
