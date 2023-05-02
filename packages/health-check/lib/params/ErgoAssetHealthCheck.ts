import ergoExplorerClientFactory from '@rosen-clients/ergo-explorer';
import ergoNodeClientFactory from '@rosen-clients/ergo-node';
import { ErgoNetworkType } from '../types';
import { AbstractAssetHealthCheckParam } from './AbstractAssetHealthCheck';

class ErgoAssetHealthCheckParam extends AbstractAssetHealthCheckParam {
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
    super(assetId, assetName, address, warnThreshold, criticalThreshold);
    this.networkType = networkType;
    if (networkType == ErgoNetworkType.NODE)
      this.nodeApi = ergoNodeClientFactory(networkUrl);
    else if (networkType == ErgoNetworkType.EXPLORER)
      this.explorerApi = ergoExplorerClientFactory(networkUrl);
  }

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

    this.tokenAmount = tokenAmount;
    this.updateTimeStamp = new Date();
  };
}

export { ErgoAssetHealthCheckParam };
