import { HealthStatusLevel } from '../../../lib';
import { TestWidHealthCheckParam } from './TestWidHealthCheck';

describe('AbstractWidHealthCheckParam', () => {
  /**
   * Creating a new instance of AbstractWidHealthCheckParam for all tests
   */
  let widHealthCheckParam: TestWidHealthCheckParam;
  beforeAll(() => {
    widHealthCheckParam = new TestWidHealthCheckParam(
      'rwtRepoAddress',
      'rwtRepoNft',
      'address'
    );
  });

  describe('getHealthStatus', () => {
    /**
     * @target AbstractWidHealthCheckParam.getHealthStatus Should return the healthy status when wid exists
     * @dependencies
     * @scenario
     * - mock widExists to true
     * - get health status
     * @expected
     * - The status should be HEALTHY when wid exists
     */
    it('should return the healthy status when wid exists', async () => {
      widHealthCheckParam.setWidStatus(true);
      const status = await widHealthCheckParam.getHealthStatus();
      expect(status).toBe(HealthStatusLevel.HEALTHY);
    });

    /**
     * @target AbstractWidHealthCheckParam.getHealthStatus Should return the broken status when wid doesn't exist
     * @dependencies
     * @scenario
     * - mock widExists to false
     * - get health status
     * @expected
     * - The status should be BROKEN when wid doesn't exist
     */
    it("should return the broken status when wid doesn't exist", async () => {
      widHealthCheckParam.setWidStatus(false);
      const status = await widHealthCheckParam.getHealthStatus();
      expect(status).toBe(HealthStatusLevel.BROKEN);
    });
  });
});
