import {
  AbstractHealthCheckParam,
  HealthStatusLevel,
} from '../AbstractHealthCheckParam';
import { BlockEntity, PROCEED } from '@rosen-bridge/scanner';
import { DataSource, Repository } from 'typeorm';

abstract class AbstractScannerSyncHealthCheckParam extends AbstractHealthCheckParam {
  private readonly blockRepository: Repository<BlockEntity>;
  protected scannerName: string;
  protected warnDifference: number;
  protected criticalDifference: number;
  protected updateTimeStamp: Date;
  protected difference: number;

  constructor(
    dataSource: DataSource,
    scannerName: string,
    warnDifference: number,
    criticalDifference: number
  ) {
    super();
    this.blockRepository = dataSource.getRepository(BlockEntity);
    this.scannerName = scannerName;
    this.warnDifference = warnDifference;
    this.criticalDifference = criticalDifference;
  }

  /**
   * if the difference between scanned blocks and network blocks is more than the differences returns the required notification
   * @returns parameter health description
   */
  getDescription = async (): Promise<string | undefined> => {
    const baseMessage =
      ` [${this.scannerName}] scanner is out of sync.\n` +
      `Please check the scanner status, [${this.difference}] blocks are created but not scanned.`;
    if (this.difference >= this.criticalDifference)
      return `Service has stopped working.` + baseMessage;
    else if (this.difference >= this.warnDifference)
      return `Service may stop working soon.` + baseMessage;
    return undefined;
  };

  /**
   * @returns last update time
   */
  getLastUpdatedTime = async (): Promise<Date | undefined> => {
    return this.updateTimeStamp;
  };

  /**
   * @returns scanner sync health status
   */
  getHealthStatus = async (): Promise<HealthStatusLevel> => {
    if (this.difference >= this.criticalDifference)
      return HealthStatusLevel.BROKEN;
    else if (this.difference >= this.warnDifference)
      return HealthStatusLevel.UNSTABLE;
    return HealthStatusLevel.HEALTHY;
  };

  /**
   * Updates the health status and the update timestamp
   */
  update = async () => {
    const lastSavedBlockHeight = await this.getLastSavedBlockHeight();
    const networkHeight = await this.getLastAvailableBlock();
    this.difference = Number(networkHeight) - lastSavedBlockHeight;
    this.updateTimeStamp = new Date();
  };

  /**
   * Returns last available block in the network
   */
  abstract getLastAvailableBlock: () => Promise<number>;

  /**
   * @returns last saved block using the specified scanner
   */
  private getLastSavedBlockHeight = async (): Promise<number> => {
    const lastBlock = await this.blockRepository.find({
      where: { status: PROCEED, scanner: this.scannerName },
      order: { height: 'DESC' },
      take: 1,
    });
    if (lastBlock.length !== 0) {
      return lastBlock[0].height;
    }
    throw new Error('No block found or error in database connection');
  };
}

export { AbstractScannerSyncHealthCheckParam };
