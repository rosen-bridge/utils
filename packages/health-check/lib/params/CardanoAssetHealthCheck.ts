import {
  AbstractHealthCheckParam,
  HealthStatusLevel,
} from './AbstractHealthCheckParam';
import cardanoKoiosClientFactory from '@rosen-clients/cardano-koios';

class CardanoAssetHealthCheckParam extends AbstractHealthCheckParam {
  private assetId: string;
  private assetName: string;
  private address: string;
  private warnThreshold: bigint;
  private criticalThreshold: bigint;
  private healthStatus: HealthStatusLevel;
  private updateTimeStamp: Date;
  private koiosApi;

  constructor(
    assetId: string,
    assetName: string,
    address: string,
    warnThreshold: bigint,
    criticalThreshold: bigint,
    koiosUrl: string
  ) {
    super();
    this.assetId = assetId;
    this.assetName = assetName;
    this.address = address;
    this.warnThreshold = warnThreshold;
    this.criticalThreshold = criticalThreshold;
    this.koiosApi = cardanoKoiosClientFactory(koiosUrl);
  }

  /**
   * generates a unique id with asset name and asset id
   * @returns parameter id
   */
  getId = (): string => {
    return `Asset-${this.assetName}-${this.assetId.slice(0, 6)}-Health-Check`;
  };

  /**
   * if asset amount is less than the thresholds returns the required notification
   * @returns parameter health description
   */
  getDescription = async (): Promise<string | undefined> => {
    if (this.healthStatus == HealthStatusLevel.UNSTABLE)
      return `The asset ${this.assetName} balance is less than the warning threshold in address ${this.address}.
       The specified address token ${this.assetId} balance should be more than ${this.warnThreshold}`;
    else if (this.healthStatus == HealthStatusLevel.BROKEN)
      return `The asset ${this.assetName} balance is less than the critical threshold in address ${this.address}.
        The specified address token ${this.assetId} balance should be more than ${this.criticalThreshold}`;
    return undefined;
  };

  /**
   * Updates the asset health status and the update timestamp
   */
  update = async () => {
    let tokenAmount = 0n;
    const assets = await this.koiosApi.address.postAddressAssets({
      _addresses: [this.address],
    });
    const token = assets[0].asset_list?.find(
      (token) => token.fingerprint == this.assetId
    );
    if (token && token.quantity) tokenAmount = BigInt(token.quantity);
    if (tokenAmount < this.criticalThreshold)
      this.healthStatus = HealthStatusLevel.BROKEN;
    else if (tokenAmount < this.warnThreshold)
      this.healthStatus = HealthStatusLevel.UNSTABLE;
    else this.healthStatus = HealthStatusLevel.HEALTHY;

    this.updateTimeStamp = new Date();
  };

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
    return this.healthStatus;
  };
}

export { CardanoAssetHealthCheckParam };
