import { AbstractScannerSyncHealthCheckParam } from './AbstractScannerSyncHealthCheck';
import { DataSource } from 'typeorm';
import cardanoKoiosClientFactory from '@rosen-clients/cardano-koios';

class CardanoScannerHealthCheck extends AbstractScannerSyncHealthCheckParam {
  private koiosApi;

  constructor(
    dataSource: DataSource,
    scannerName: string,
    warnDifference: number,
    criticalDifference: number,
    networkUrl: string
  ) {
    super(dataSource, scannerName, warnDifference, criticalDifference);
    this.koiosApi = cardanoKoiosClientFactory(networkUrl);
  }

  /**
   * Updates the height difference and the update timestamp
   */
  update = async () => {
    const lastSavedBlockHeight = await this.getLastSavedBlockHeight();
    const networkHeight = (await this.koiosApi.network.getTip())[0].block_no;
    this.difference = Number(networkHeight) - lastSavedBlockHeight;
    this.updateTimeStamp = new Date();
  };
}

export { CardanoScannerHealthCheck };
