import ergoNodeClientFactory from '@rosen-clients/ergo-node';
import { AbstractScannerSyncHealthCheckParam } from './AbstractScannerSyncHealthCheck';
import { DataSource } from 'typeorm';
import ergoExplorerClientFactory from '@rosen-clients/ergo-explorer';

class ErgoNodeScannerHealthCheck extends AbstractScannerSyncHealthCheckParam {
  private nodeApi;

  constructor(
    dataSource: DataSource,
    scannerName: string,
    warnDifference: number,
    criticalDifference: number,
    networkUrl: string
  ) {
    super(dataSource, scannerName, warnDifference, criticalDifference);
    this.nodeApi = ergoNodeClientFactory(networkUrl);
  }

  /**
   * Updates the height difference and the update timestamp
   */
  update = async () => {
    const lastSavedBlockHeight = await this.getLastSavedBlockHeight();
    const networkHeight = (await this.nodeApi.info.getNodeInfo()).fullHeight;
    this.difference = Number(networkHeight) - lastSavedBlockHeight;
    this.updateTimeStamp = new Date();
  };
}

class ErgoExplorerScannerHealthCheck extends AbstractScannerSyncHealthCheckParam {
  private explorerApi;

  constructor(
    dataSource: DataSource,
    scannerName: string,
    warnDifference: number,
    criticalDifference: number,
    networkUrl: string
  ) {
    super(dataSource, scannerName, warnDifference, criticalDifference);
    this.explorerApi = ergoExplorerClientFactory(networkUrl);
  }

  /**
   * Updates the height difference and the update timestamp
   */
  update = async () => {
    const lastSavedBlockHeight = await this.getLastSavedBlockHeight();
    const networkHeight = (await this.explorerApi.v1.getApiV1Networkstate())
      .height;
    this.difference = Number(networkHeight) - lastSavedBlockHeight;
    this.updateTimeStamp = new Date();
  };
}

export { ErgoNodeScannerHealthCheck, ErgoExplorerScannerHealthCheck };
