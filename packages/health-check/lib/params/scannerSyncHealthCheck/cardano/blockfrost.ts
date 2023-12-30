import { AbstractScannerSyncHealthCheckParam } from '../AbstractScannerSyncHealthCheck';
import { DataSource } from 'typeorm';
import { BlockFrostAPI } from '@blockfrost/blockfrost-js';

export class CardanoBlockFrostScannerHealthCheck extends AbstractScannerSyncHealthCheckParam {
  protected client;

  constructor(
    dataSource: DataSource,
    scannerName: string,
    warnDifference: number,
    criticalDifference: number,
    projectId: string,
    url?: string
  ) {
    super(dataSource, scannerName, warnDifference, criticalDifference);
    this.client = new BlockFrostAPI({
      projectId: projectId,
      customBackend: url,
      network: 'mainnet',
    });
  }

  /**
   * generates a unique id with network name and type
   * @returns parameter id
   */
  getId = (): string => {
    return `Cardano Scanner Sync (BlockFrost)`;
  };

  /**
   * @returns last available block in network
   */
  getLastAvailableBlock = () => {
    return this.client.blocksLatest().then((block) => {
      const height = block.height;
      return height ?? 0;
    });
  };
}
