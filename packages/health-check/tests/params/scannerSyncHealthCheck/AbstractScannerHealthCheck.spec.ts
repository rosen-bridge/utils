import { HealthStatusLevel } from '../../../lib';
import { TestScannerHealthCheckParam } from './TestScannerSyncHealthCheck';
import { createDataSource } from './Utils';
import { BlockEntity, PROCEED } from '@rosen-bridge/scanner';
import { DataSource } from 'typeorm';

describe('AbstractScannerHealthCheckParam', () => {
  /**
   * Creating a new instance of AbstractScannerHealthCheckParam for all tests
   */
  let scannerHealthCheckParam: TestScannerHealthCheckParam;
  let dataSource: DataSource;
  beforeAll(async () => {
    dataSource = await createDataSource();
    scannerHealthCheckParam = new TestScannerHealthCheckParam(
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
      scannerHealthCheckParam.setDifference(2);
      const status = await scannerHealthCheckParam.getHealthStatus();
      expect(status).toBe(HealthStatusLevel.HEALTHY);
    });

    /**
     * @target AbstractScannerHealthCheckParam.getHealthStatus Should return UNSTABLE when difference is more than warning threshold and less than critical threshold
     * @dependencies
     * @scenario
     * - mock difference to more than warning threshold
     * - get health status
     * @expected
     * - The status should be UNSTABLE
     */
    it('should return UNSTABLE when difference is more than warning threshold and less than critical threshold', async () => {
      scannerHealthCheckParam.setDifference(20);
      const status = await scannerHealthCheckParam.getHealthStatus();
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
      scannerHealthCheckParam.setDifference(200);
      const status = await scannerHealthCheckParam.getHealthStatus();
      expect(status).toBe(HealthStatusLevel.BROKEN);
    });
  });

  describe('update', () => {
    /**
     * @target AbstractScannerHealthCheckParam.update should update the height difference correctly
     * @dependencies
     * @scenario
     * - save a block in database
     * - update the parameter
     * - check the difference
     * @expected
     * - The difference should set correctly
     */
    it('should update the height difference correctly', async () => {
      const ergoBlockEntity = new BlockEntity();
      ergoBlockEntity.scanner = 'scannerName';
      ergoBlockEntity.id = 1;
      ergoBlockEntity.hash = 'blockHash';
      ergoBlockEntity.height = 1111;
      ergoBlockEntity.parentHash = 'parentHash';
      ergoBlockEntity.status = PROCEED;
      ergoBlockEntity.timestamp = 12345;
      await dataSource.getRepository(BlockEntity).insert([ergoBlockEntity]);
      await scannerHealthCheckParam.update();
      expect(scannerHealthCheckParam.getDifference()).toBe(4);
    });
  });
});
