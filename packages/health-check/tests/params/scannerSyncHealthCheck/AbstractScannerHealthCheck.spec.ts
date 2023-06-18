import { HealthStatusLevel } from '../../../lib';
import { TestScannerHealthCheckParam } from './TestScannerSyncHealthCheck';
import { createDataSource } from './Utils';

describe('AbstractScannerHealthCheckParam', () => {
  /**
   * Creating a new instance of AbstractScannerHealthCheckParam for all tests
   */
  let assetHealthCheckParam: TestScannerHealthCheckParam;
  beforeAll(async () => {
    const dataSource = await createDataSource();
    assetHealthCheckParam = new TestScannerHealthCheckParam(
      dataSource,
      'scannerName',
      10,
      100
    );
  });

  describe('getHealthStatus', () => {
    /**
     * @target AbstractScannerHealthCheckParam.getHealthStatus should return HEALTHY when difference is less than warning threshold
     * @dependencies
     * @scenario
     * - mock difference is less than warning threshold
     * - get health status
     * @expected
     * - The status should be HEALTHY
     */
    it('should return HEALTHY when difference is less than warning threshold', async () => {
      assetHealthCheckParam.setDifference(2);
      const status = await assetHealthCheckParam.getHealthStatus();
      expect(status).toBe(HealthStatusLevel.HEALTHY);
    });

    /**
     * @target AbstractScannerHealthCheckParam.getHealthStatus Should return UNSTABLE when difference is more than warning threshold
     * @dependencies
     * @scenario
     * - mock difference to more than warning threshold
     * - get health status
     * @expected
     * - The status should be UNSTABLE
     */
    it('should return UNSTABLE when difference is more than warning threshold', async () => {
      assetHealthCheckParam.setDifference(20);
      const status = await assetHealthCheckParam.getHealthStatus();
      expect(status).toBe(HealthStatusLevel.UNSTABLE);
    });

    /**
     * @target AbstractScannerHealthCheckParam.getHealthStatus Should return the should return BROKEN when difference is more than critical threshold
     * @dependencies
     * @scenario
     * - mock difference to less than critical threshold
     * - get health status
     * @expected
     * - The status should be BROKEN
     */
    it('should return BROKEN when difference is more than critical threshold', async () => {
      assetHealthCheckParam.setDifference(200);
      const status = await assetHealthCheckParam.getHealthStatus();
      expect(status).toBe(HealthStatusLevel.BROKEN);
    });
  });
});
