import { AbstractScannerSyncHealthCheckParam } from './AbstractScannerSyncHealthCheck';
import { DataSource } from 'typeorm';
import cardanoKoiosClientFactory from '@rosen-clients/cardano-koios';
import {
  createInteractionContext,
  InteractionContext,
  createStateQueryClient,
} from '@cardano-ogmios/client';
class CardanoKoiosScannerHealthCheck extends AbstractScannerSyncHealthCheckParam {
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
   * @returns last available block in network
   */
  getLastAvailableBlock = async () => {
    return Number((await this.koiosApi.network.getTip())[0].block_no);
  };
}

class CardanoOgmiosScannerHealthCheck extends AbstractScannerSyncHealthCheckParam {
  private ogmiosPort: number;
  private ogmiosHost: string;

  constructor(
    dataSource: DataSource,
    scannerName: string,
    warnDifference: number,
    criticalDifference: number,
    ogmiosHost: string,
    ogmiosPort: number
  ) {
    super(dataSource, scannerName, warnDifference, criticalDifference);
    this.ogmiosHost = ogmiosHost;
    this.ogmiosPort = ogmiosPort;
  }

  /**
   * @returns last available block in network
   */
  getLastAvailableBlock = async () => {
    const context: InteractionContext = await createInteractionContext(
      (err) => console.error(err),
      () => undefined,
      { connection: { port: this.ogmiosPort, host: this.ogmiosHost } }
    );
    const ogmiosClient = await createStateQueryClient(context);
    const height = await ogmiosClient.blockHeight();
    if (height == 'origin') return 0;
    else return height;
  };
}

export { CardanoKoiosScannerHealthCheck, CardanoOgmiosScannerHealthCheck };