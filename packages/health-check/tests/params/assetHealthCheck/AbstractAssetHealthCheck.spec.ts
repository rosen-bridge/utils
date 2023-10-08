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
      10n,
      0
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
     * @target AbstractAssetHealthCheckParam.getHealthStatus Should return BROKEN when token amount is less than critical threshold
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

  describe('getTokenAmountStr', () => {
    /**
     * @target AbstractAssetHealthCheckParam.getTokenAmountStr should return correct format without decimal
     * @dependencies
     * @scenario
     * - mock token decimal
     * - get token decimal str
     * @expected
     * - should return the amount str without any change
     */
    it('should return correct format without decimal', () => {
      assetHealthCheckParam.setTokenDecimal(0);
      expect(assetHealthCheckParam.getTokenDecimalStr(99n)).toEqual('99');
    });

    /**
     * @target AbstractAssetHealthCheckParam.getTokenAmountStr should return correct format with 1 decimal
     * @dependencies
     * @scenario
     * - mock token decimal
     * - get token decimal str
     * @expected
     * - should return the amount str with one decimal
     */
    it('should return correct format with 1 decimal', () => {
      assetHealthCheckParam.setTokenDecimal(1);
      expect(assetHealthCheckParam.getTokenDecimalStr(99n)).toEqual('9.9');
    });

    /**
     * @target AbstractAssetHealthCheckParam.getTokenAmountStr should return correct format with 2 decimals
     * @dependencies
     * @scenario
     * - mock token decimal
     * - get token decimal str
     * @expected
     * - should return the amount str with 2 decimals
     */
    it('should generate correct format with 2 decimals', () => {
      assetHealthCheckParam.setTokenDecimal(2);
      expect(assetHealthCheckParam.getTokenDecimalStr(99n)).toEqual('0.99');
    });

    /**
     * @target AbstractAssetHealthCheckParam.getTokenAmountStr should return correct format with 3 decimals
     * @dependencies
     * @scenario
     * - mock token decimal
     * - get token decimal str
     * @expected
     * - should return the amount str with 3 decimals
     */
    it('should generate correct format with 3 decimals', () => {
      assetHealthCheckParam.setTokenDecimal(3);
      expect(assetHealthCheckParam.getTokenDecimalStr(99n)).toEqual('0.099');
    });
  });
});
