import { TestCardanoScannerHealthCheck } from './TestCardanoScannerSyncHealthCheck';
import cardanoKoiosClientFactory from '@rosen-clients/cardano-koios';
import { createDataSource } from './Utils';

jest.mock('@rosen-clients/cardano-koios');

describe('CardanoScannerHealthCheck', () => {
  describe('update', () => {
    /**
     * @target CardanoScannerHealthCheck.update Should update the token amount
     * @dependencies
     * - cardanoKoiosClientFactory
     * @scenario
     * - mock return value of koios last block info
     * - create new instance of CardanoScannerHealthCheck
     * - update the parameter
     * @expected
     * - The token amount should update successfully
     */
    it('Should update the token amount', async () => {
      jest.mocked(cardanoKoiosClientFactory).mockReturnValue({
        network: {
          getTip: async () => [
            {
              block_no: 1115,
            },
          ],
        },
      } as any);

      const dataSource = await createDataSource();
      const scannerHealthCheckParam = new TestCardanoScannerHealthCheck(
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
