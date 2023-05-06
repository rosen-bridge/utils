import { HealthStatusLevel } from '../../../lib';
import { TestAssetHealthCheckParam } from './TestAssetHealthCheck';

describe('AbstractAssetHealthCheckParam', () => {
  /**
   * Creating a new instance of AbstractAssetHealthCheckParam for all tests
   */
  let assetHealthCheckParam: TestAssetHealthCheckParam;
  beforeAll(() => {
    assetHealthCheckParam = new TestAssetHealthCheckParam(
      'assetId',
      'assetName',
      'address',
      100n,
      10n
    );
  });

  describe('getHealthStatus', () => {
    /**
     * @target AbstractAssetHealthCheckParam.getHealthStatus should return HEALTHY when token amount is more than warning threshold
     * @dependencies
     * @scenario
     * - mock token amount to more than warning threshold
     * - get health status
     * @expected
     * - The status should be HEALTHY
     */
    it('should return HEALTHY when token amount is more than warning threshold', async () => {
      assetHealthCheckParam.setTokenAmount(1200n);
      const status = await assetHealthCheckParam.getHealthStatus();
      expect(status).toBe(HealthStatusLevel.HEALTHY);
    });

    /**
     * @target AbstractAssetHealthCheckParam.getHealthStatus Should return UNSTABLE when token amount is less than warning threshold
     * @dependencies
     * @scenario
     * - mock token amount to less than warning threshold
     * - get health status
     * @expected
     * - The status should be UNSTABLE
     */
    it('should return UNSTABLE when token amount is less than warning threshold', async () => {
      assetHealthCheckParam.setTokenAmount(90n);
      const status = await assetHealthCheckParam.getHealthStatus();
      expect(status).toBe(HealthStatusLevel.UNSTABLE);
    });

    /**
     * @target AbstractAssetHealthCheckParam.getHealthStatus Should return the should return BROKEN when token amount is less than critical threshold
     * @dependencies
     * @scenario
     * - mock token amount to less than critical threshold
     * - get health status
     * @expected
     * - The status should be BROKEN
     */
    it('should return BROKEN when token amount is less than critical threshold', async () => {
      assetHealthCheckParam.setTokenAmount(9n);
      const status = await assetHealthCheckParam.getHealthStatus();
      expect(status).toBe(HealthStatusLevel.BROKEN);
    });
  });
});
