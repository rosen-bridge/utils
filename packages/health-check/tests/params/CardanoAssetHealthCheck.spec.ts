import { HealthStatusLevel } from '../../lib';
import { CardanoAssetHealthCheckParam } from '../../lib/params/CardanoAssetHealthCheck';
import { mockKoiosAssetQuantity } from './mocked/CardanoAssetHealthCheck.mock';

jest.mock('@rosen-clients/cardano-koios');

describe('CardanoAssetHealthCheck', () => {
  describe('update', () => {
    /**
     * @target CardanoAssetHealthCheck.update Should update the status to healthy
     * @dependencies
     * - cardanoKoiosClientFactory
     * @scenario
     * - mock return value of koios token amount to more than sufficient
     * - create new instance of CardanoAssetHealthCheck
     * - update the status
     * - check the status
     * @expected
     * - The status should update successfully using koios api
     */
    it('Should update the status to healthy', async () => {
      mockKoiosAssetQuantity(1200n);
      const assetHealthCheckParam = new CardanoAssetHealthCheckParam(
        'assetId',
        'assetName',
        'address',
        100n,
        10n,
        'url'
      );
      await assetHealthCheckParam.update();
      const healthStatus = await assetHealthCheckParam.getHealthStatus();

      expect(healthStatus).toBe(HealthStatusLevel.HEALTHY);
    });

    /**
     * @target CardanoAssetHealthCheck.update Should update the status to unstable
     * @dependencies
     * - cardanoKoiosClientFactory
     * @scenario
     * - mock return value of koios token amount to less than warning threshold
     * - create new instance of CardanoAssetHealthCheck
     * - update the status
     * - check the status
     * @expected
     * - The status should update successfully using koios api
     */
    it('Should update the status to unstable', async () => {
      mockKoiosAssetQuantity(90n);
      const assetHealthCheckParam = new CardanoAssetHealthCheckParam(
        'assetId',
        'assetName',
        'address',
        100n,
        10n,
        'url'
      );
      await assetHealthCheckParam.update();
      const healthStatus = await assetHealthCheckParam.getHealthStatus();

      expect(healthStatus).toBe(HealthStatusLevel.UNSTABLE);
    });

    /**
     * @target CardanoAssetHealthCheck.update Should update the status to broken
     * @dependencies
     * - cardanoKoiosClientFactory
     * @scenario
     * - mock return value of koios token amount to less than critical threshold
     * - create new instance of CardanoAssetHealthCheck
     * - update the status
     * - check the status
     * @expected
     * - The status should update successfully using koios api
     */
    it('Should update the status to broken', async () => {
      mockKoiosAssetQuantity(9n);
      const assetHealthCheckParam = new CardanoAssetHealthCheckParam(
        'assetId',
        'assetName',
        'address',
        100n,
        10n,
        'url'
      );
      await assetHealthCheckParam.update();
      const healthStatus = await assetHealthCheckParam.getHealthStatus();

      expect(healthStatus).toBe(HealthStatusLevel.BROKEN);
    });
  });
});
