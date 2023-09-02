import cardanoKoiosClientFactory from '@rosen-clients/cardano-koios';
import { createDataSource } from './Utils';
import {
  CardanoKoiosScannerHealthCheck,
  CardanoOgmiosScannerHealthCheck,
} from '../../../lib';
import { createStateQueryClient } from '@cardano-ogmios/client';

jest.mock('@cardano-ogmios/client');
jest.mock('@rosen-clients/cardano-koios');

describe('CardanoScannerHealthCheck', () => {
  describe('CardanoKoiosScannerHealthCheck.getLastAvailableBlock', () => {
    /**
     * @target CardanoKoiosScannerHealthCheck.update Should return the last available block in network
     * @dependencies
     * - cardanoKoiosClientFactory
     * @scenario
     * - mock return value of koios last block info
     * - create new instance of CardanoKoiosScannerHealthCheck
     * - update the parameter
     * @expected
     * - The block height should be correct
     */
    it('Should return the last available block in network', async () => {
      jest.mocked(cardanoKoiosClientFactory).mockReturnValue({
        getTip: async () => [
          {
            block_no: 1115,
          },
        ],
      } as any);

      const dataSource = await createDataSource();
      const scannerHealthCheckParam = new CardanoKoiosScannerHealthCheck(
        dataSource,
        'scannerName',
        100,
        10,
        'url'
      );
      const height = await scannerHealthCheckParam.getLastAvailableBlock();
      expect(height).toEqual(1115);
    });
  });

  describe('CardanoOgmiosScannerHealthCheck.getLastAvailableBlock', () => {
    /**
     * @target CardanoOgmiosScannerHealthCheck.update Should return the last available block in network
     * @dependencies
     * - cardanoKoiosClientFactory
     * @scenario
     * - mock return value of ogmios api
     * - create new instance of CardanoOgmiosScannerHealthCheck
     * - update the parameter
     * @expected
     * - The block height should be correct
     */
    it('Should return the last available block in network', async () => {
      jest.mocked(createStateQueryClient).mockImplementation(async () => {
        return {
          blockHeight: async () => 1115,
        } as any;
      });

      const dataSource = await createDataSource();
      const scannerHealthCheckParam = new CardanoOgmiosScannerHealthCheck(
        dataSource,
        'scannerName',
        100,
        10,
        'url',
        123
      );
      const height = await scannerHealthCheckParam.getLastAvailableBlock();
      expect(height).toEqual(1115);
    });
  });
});
