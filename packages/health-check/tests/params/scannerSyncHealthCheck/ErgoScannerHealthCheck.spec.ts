import ergoExplorerClientFactory from '@rosen-clients/ergo-explorer';
import ergoNodeClientFactory from '@rosen-clients/ergo-node';
import { createDataSource } from './Utils';
import {
  ErgoExplorerScannerHealthCheck,
  ErgoNodeScannerHealthCheck,
} from '../../../lib';

jest.mock('@rosen-clients/ergo-node');
jest.mock('@rosen-clients/ergo-explorer');

describe('ErgoExplorerScannerHealthCheck', () => {
  describe('update', () => {
    /**
     * @target ErgoExplorerScannerHealthCheck.update Should return the last available block in network
     * @dependencies
     * - ergoExplorerClientFactory
     * @scenario
     * - mock return value of explorer last block info
     * - create new instance of ErgoExplorerScannerHealthCheck
     * - update the parameter
     * @expected
     * - The block height should be correct
     */
    it('Should return the last available block in network', async () => {
      jest.mocked(ergoExplorerClientFactory).mockReturnValue({
        v1: {
          getApiV1Networkstate: async () => ({
            height: 1115,
          }),
        },
      } as any);

      const dataSource = await createDataSource();
      const scannerHealthCheckParam = new ErgoExplorerScannerHealthCheck(
        dataSource,
        'scannerName',
        100,
        10,
        'url'
      );
      const height = await scannerHealthCheckParam.getLastAvailableBlock();
      expect(height).toBe(1115);
    });
  });
});

describe('ErgoNodeScannerHealthCheck', () => {
  describe('update', () => {
    /**
     * @target ErgoNodeScannerHealthCheck.update Should return the last available block in network
     * @dependencies
     * - ergoNodeClientFactory
     * @scenario
     * - mock return value of node last block info
     * - create new instance of ErgoNodeScannerHealthCheck
     * - update the parameter
     * @expected
     * - The block height should be correct
     */
    it('Should return the last available block in network', async () => {
      jest.mocked(ergoNodeClientFactory).mockReturnValue({
        info: {
          getNodeInfo: async () => ({
            fullHeight: 1115,
          }),
        },
      } as any);

      const dataSource = await createDataSource();
      const scannerHealthCheckParam = new ErgoNodeScannerHealthCheck(
        dataSource,
        'scannerName',
        100,
        10,
        'url'
      );
      const height = await scannerHealthCheckParam.getLastAvailableBlock();
      expect(height).toBe(1115);
    });
  });
});
