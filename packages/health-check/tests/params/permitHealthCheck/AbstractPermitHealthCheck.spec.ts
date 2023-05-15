import { HealthStatusLevel } from '../../../lib';
import { TestPermitHealthCheckParam } from './TestPermitHealthCheck';

describe('AbstractPermitHealthCheckParam', () => {
  /**
   * Creating a new instance of AbstractPermitHealthCheckParam for all tests
   */
  let permitHealthCheckParam: TestPermitHealthCheckParam;
  beforeAll(() => {
    permitHealthCheckParam = new TestPermitHealthCheckParam(
      'RWT',
      'permitAddress',
      'WID',
      100n,
      10n
    );
  });

  describe('getHealthStatus', () => {
    /**
     * @target AbstractPermitHealthCheckParam.getHealthStatus Should return the healthy status
     * @dependencies
     * @scenario
     * - mock permit count to more than warning threshold
     * - get health status
     * @expected
     * - The status should be HEALTHY when permit count is more than warning threshold
     */
    it('should return the healthy status when permit count is more than warning threshold', async () => {
      permitHealthCheckParam.setRWTAmount(1200n);
      const status = await permitHealthCheckParam.getHealthStatus();
      expect(status).toBe(HealthStatusLevel.HEALTHY);
    });

    /**
     * @target AbstractPermitHealthCheckParam.getHealthStatus Should return the unstable status
     * @dependencies
     * @scenario
     * - mock permit count to less than warning threshold
     * - get health status
     * @expected
     * - The status should be UNSTABLE when permit count is less than warning threshold
     */
    it('should return the unstable status when permit count is less than warning threshold', async () => {
      permitHealthCheckParam.setRWTAmount(90n);
      const status = await permitHealthCheckParam.getHealthStatus();
      expect(status).toBe(HealthStatusLevel.UNSTABLE);
    });

    /**
     * @target AbstractPermitHealthCheckParam.getHealthStatus Should return the broken status
     * @dependencies
     * @scenario
     * - mock permit count to less than critical threshold
     * - get health status
     * @expected
     * - The status should be BROKEN when permit count is less than critical threshold'
     */
    it('should return the broken status when permit count is less than critical threshold', async () => {
      permitHealthCheckParam.setRWTAmount(9n);
      const status = await permitHealthCheckParam.getHealthStatus();
      expect(status).toBe(HealthStatusLevel.BROKEN);
    });
  });
});
