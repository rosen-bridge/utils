import { CARDANO_NATIVE_ASSET, ERGO_NATIVE_ASSET } from '../../constants';
import {
  AbstractHealthCheckParam,
  HealthStatusLevel,
} from '../AbstractHealthCheckParam';

abstract class AbstractAssetHealthCheckParam extends AbstractHealthCheckParam {
  protected assetName: string;
  protected assetId: string;
  protected address: string;
  protected tokenAmount: bigint;
  protected warnThreshold: bigint;
  protected criticalThreshold: bigint;
  protected updateTimeStamp: Date;

  constructor(
    assetId: string,
    assetName: string,
    address: string,
    warnThreshold: bigint,
    criticalThreshold: bigint
  ) {
    super();
    this.assetId = assetId;
    this.assetName = assetName;
    this.address = address;
    this.warnThreshold = warnThreshold;
    this.criticalThreshold = criticalThreshold;
  }

  /**
   * generates a unique id with asset name and asset id
   * @returns parameter id
   */
  getId = (): string => {
    if ([ERGO_NATIVE_ASSET, CARDANO_NATIVE_ASSET].includes(this.assetId))
      return `Native Asset ${this.assetName} Check`;
    return `Asset ${this.assetName} [${this.assetId.slice(0, 6)}...] Check`;
  };

  /**
   * if asset amount is less than the thresholds returns the required notification
   * @returns parameter health description
   */
  getDescription = async (): Promise<string | undefined> => {
    if (this.tokenAmount < this.criticalThreshold)
      return (
        `Service stopped working due to insufficient asset '${this.assetName}' balance` +
        ` ([${this.tokenAmount}] is less than required amount [${this.criticalThreshold}]).\n` +
        `Please charge [${this.address}] with asset [${this.assetId}]`
      );
    else if (this.tokenAmount < this.warnThreshold)
      return (
        `Service is in unstable situation due to insufficient asset '${this.assetName}' balance` +
        ` ([${this.tokenAmount}] is less than recommended amount [${this.warnThreshold}]).\n` +
        `Please charge [${this.address}] with asset [${this.assetId}]`
      );
    return undefined;
  };

  /**
   * Updates the asset health status and the update timestamp
   */
  abstract update: () => unknown;

  /**
   * @returns last update time
   */
  getLastUpdatedTime = async (): Promise<Date | undefined> => {
    return this.updateTimeStamp;
  };

  /**
   * @returns asset health status
   */
  getHealthStatus = async (): Promise<HealthStatusLevel> => {
    if (this.tokenAmount < this.criticalThreshold)
      return HealthStatusLevel.BROKEN;
    else if (this.tokenAmount < this.warnThreshold)
      return HealthStatusLevel.UNSTABLE;
    else return HealthStatusLevel.HEALTHY;
  };
}

export { AbstractAssetHealthCheckParam };
