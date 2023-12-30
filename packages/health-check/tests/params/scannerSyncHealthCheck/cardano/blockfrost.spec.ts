import { TestCardanoBlockFrostScannerHealthCheck } from '../TestScannerHealthChecks';
import { createDataSource } from '../Utils';

describe('CardanoBlockFrostScannerHealthCheck.getLastAvailableBlock', () => {
  /**
   * @target CardanoBlockFrostScannerHealthCheck.update should return the last available block in network
   * @dependencies
   * - BlockFrostAPI
   * @scenario
   * - mock return value of blockfrost last block info
   * - create new instance of CardanoBlockFrostScannerHealthCheck
   * - update the parameter
   * @expected
   * - The block height should be correct
   */
  it('should return the last available block in network', async () => {
    const dataSource = await createDataSource();
    const scannerHealthCheckParam = new TestCardanoBlockFrostScannerHealthCheck(
      dataSource,
      'scannerName',
      100,
      10,
      'url'
    );
    jest
      .spyOn(scannerHealthCheckParam.getClient(), 'blocksLatest')
      .mockResolvedValue({ height: 1115 } as any);
    const height = await scannerHealthCheckParam.getLastAvailableBlock();
    expect(height).toEqual(1115);
  });
});
