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
   * generates a unique id with scannerName
   * @returns parameter id
   */
  getId = (): string => {
    return `Scanner ${this.scannerName} Sync Check`;
  };

  /**
   * if the difference between scanned blocks and network blocks is more than the differences returns the required notification
   * @returns parameter health description
   */
  getDescription = async (): Promise<string | undefined> => {
    if (this.difference >= this.criticalDifference)
      return (
        `Service has stopped working the [${this.scannerName}] scanner is out of sync.` +
        `Please check the scanner status, [${this.difference}] blocks are created but not scanned`
      );
    else if (this.difference >= this.warnDifference)
      return (
        `Service may stop working soon. [${this.scannerName}] scanner is out of sync.` +
        `Please check the scanner status, [${this.difference}] blocks are created but not scanned`
      );
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
  abstract update: () => unknown;

  /**
   * @returns last saved block using the specified scanner
   */
  getLastSavedBlockHeight = async (): Promise<number> => {
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
