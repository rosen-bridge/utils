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
  protected assetDecimal: number;

  constructor(
    assetId: string,
    assetName: string,
    address: string,
    warnThreshold: bigint,
    criticalThreshold: bigint,
    assetDecimal: number
  ) {
    super();
    this.assetId = assetId;
    if ([ERGO_NATIVE_ASSET, CARDANO_NATIVE_ASSET].includes(assetId))
      this.assetName = assetName.toUpperCase();
    else this.assetName = assetName;
    this.address = address;
    this.warnThreshold = warnThreshold;
    this.criticalThreshold = criticalThreshold;
    this.assetDecimal = assetDecimal;
  }

  /**
   * generates a unique id with asset name and asset id
   * @returns parameter id
   */
  getId = (): string => {
    if ([ERGO_NATIVE_ASSET, CARDANO_NATIVE_ASSET].includes(this.assetId))
      return `Native Asset ${this.assetName}`;
    return `Asset ${this.assetName} [${this.assetId.slice(0, 6)}...]`;
  };

  /**
   * if asset amount is less than the thresholds returns the required notification
   * @returns parameter health description
   */
  getDescription = async (): Promise<string | undefined> => {
    const roundTokenAmount =
      this.tokenAmount.toString().slice(0, -this.assetDecimal) || '0';
    const decimalTokenAmount = this.tokenAmount
      .toString()
      .slice(-this.assetDecimal)
      .padStart(this.assetDecimal, '0');
    const amountStr = roundTokenAmount + '.' + decimalTokenAmount;
    if (this.tokenAmount < this.criticalThreshold)
      return (
        `Service has stopped working due to insufficient asset '${this.assetName}' balance` +
        ` ([${this.criticalThreshold}] '${this.assetName}' is required, but [${amountStr}] is available.).\n` +
        `Please top up [${this.address}] with asset [${this.assetId}]`
      );
    else if (this.tokenAmount < this.warnThreshold)
      return (
        `Service is in unstable situation due to low asset '${this.assetName}' balance` +
        ` ([${this.warnThreshold}] '${this.assetName}' is recommended, but [${amountStr}] is available.).\n` +
        `Please top up [${this.address}] with asset [${this.assetId}], otherwise your service will stop working soon.`
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
    if (
      this.tokenAmount <
      this.criticalThreshold * 10n ** BigInt(this.assetDecimal)
    )
      return HealthStatusLevel.BROKEN;
    else if (
      this.tokenAmount <
      this.warnThreshold * 10n ** BigInt(this.assetDecimal)
    )
      return HealthStatusLevel.UNSTABLE;
    else return HealthStatusLevel.HEALTHY;
  };
}

export { AbstractAssetHealthCheckParam };
