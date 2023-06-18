import {
  TestErgoExplorerScannerHealthCheck,
  TestErgoNodeScannerHealthCheck,
} from './TestErgoScannerSyncHealthCheck';
import ergoExplorerClientFactory from '@rosen-clients/ergo-explorer';
import ergoNodeClientFactory from '@rosen-clients/ergo-node';
import { createDataSource } from './Utils';

jest.mock('@rosen-clients/ergo-node');
jest.mock('@rosen-clients/ergo-explorer');

describe('ErgoExplorerScannerHealthCheck', () => {
  describe('update', () => {
    /**
     * @target ErgoExplorerScannerHealthCheck.update Should update the difference
     * @dependencies
     * - ergoExplorerClientFactory
     * @scenario
     * - mock return value of explorer last block info
     * - create new instance of ErgoExplorerScannerHealthCheck
     * - update the parameter
     * @expected
     * - The difference should update successfully
     */
    it('Should update the difference', async () => {
      jest.mocked(ergoExplorerClientFactory).mockReturnValue({
        v1: {
          getApiV1Networkstate: async () => ({
            height: 1115,
          }),
        },
      } as any);

      const dataSource = await createDataSource();
      const scannerHealthCheckParam = new TestErgoExplorerScannerHealthCheck(
        dataSource,
        'scannerName',
        100,
        10,
        'url'
      );
      await scannerHealthCheckParam.update();
      expect(scannerHealthCheckParam.getDifference()).toBe(4);
    });
  });
});

describe('ErgoNodeScannerHealthCheck', () => {
  describe('update', () => {
    /**
     * @target ErgoNodeScannerHealthCheck.update Should update the difference
     * @dependencies
     * - ergoNodeClientFactory
     * @scenario
     * - mock return value of node last block info
     * - create new instance of ErgoNodeScannerHealthCheck
     * - update the parameter
     * @expected
     * - The difference should update successfully
     */
    it('Should update the difference', async () => {
      jest.mocked(ergoNodeClientFactory).mockReturnValue({
        info: {
          getNodeInfo: async () => ({
            fullHeight: 1115,
          }),
        },
      } as any);

      const dataSource = await createDataSource();
      const scannerHealthCheckParam = new TestErgoNodeScannerHealthCheck(
        dataSource,
        'scannerName',
        100,
        10,
        'url'
      );
      await scannerHealthCheckParam.update();
      expect(scannerHealthCheckParam.getDifference()).toBe(4);
    });
  });
});
