import ergoExplorerClientFactory from '@rosen-clients/ergo-explorer';
import {
  AbstractHealthCheckParam,
  HealthStatusLevel,
} from './AbstractHealthCheckParam';
import ergoNodeClientFactory from '@rosen-clients/ergo-node';
import { ErgoNetworkType } from '../types';

class ErgoAssetHealthCheckParam extends AbstractHealthCheckParam {
  private assetId: string;
  private assetName: string;
  private address: string;
  private warnThreshold: bigint;
  private criticalThreshold: bigint;
  private healthStatus: HealthStatusLevel;
  private updateTimeStamp: Date;
  private networkType: ErgoNetworkType;
  private nodeApi;
  private explorerApi;

  constructor(
    assetId: string,
    assetName: string,
    address: string,
    warnThreshold: bigint,
    criticalThreshold: bigint,
    networkUrl: string,
    networkType: ErgoNetworkType
  ) {
    super();
    this.assetId = assetId;
    this.assetName = assetName;
    this.address = address;
    this.networkType = networkType;
    this.warnThreshold = warnThreshold;
    this.criticalThreshold = criticalThreshold;
    if (networkType == ErgoNetworkType.NODE)
      this.nodeApi = ergoNodeClientFactory(networkUrl);
    else if (networkType == ErgoNetworkType.EXPLORER)
      this.explorerApi = ergoExplorerClientFactory(networkUrl);
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
    if (this.networkType == ErgoNetworkType.NODE) {
      const assets = await this.nodeApi!.blockchain.getAddressBalanceTotal(
        this.address
      );
      const token = assets?.confirmed?.tokens.find(
        (token) => token.tokenId == this.assetId
      );
      if (token && token.amount) tokenAmount = token.amount;
    }
    if (this.networkType == ErgoNetworkType.EXPLORER) {
      const assets =
        await this.explorerApi!.v1.getApiV1AddressesP1BalanceConfirmed(
          this.address
        );
      const token = assets.tokens?.find(
        (token) => token.tokenId == this.assetId
      );
      if (token) tokenAmount = token.amount;
    }
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

export { ErgoAssetHealthCheckParam, ErgoNetworkType };
