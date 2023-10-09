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
   * generates a unique id with network name and type
   * @returns parameter id
   */
  getId = (): string => {
    return `Ergo Scanner Sync (Node)`;
  };

  /**
   * @returns last available block in network
   */
  getLastAvailableBlock = async () => {
    return Number((await this.nodeApi.getNodeInfo()).fullHeight);
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
   * generates a unique id with network name and type
   * @returns parameter id
   */
  getId = (): string => {
    return `Ergo Scanner Sync (Explorer)`;
  };

  /**
   * @returns last available block in network
   */
  getLastAvailableBlock = async () => {
    return Number((await this.explorerApi.v1.getApiV1Networkstate()).height);
  };
}

export { ErgoNodeScannerHealthCheck, ErgoExplorerScannerHealthCheck };
