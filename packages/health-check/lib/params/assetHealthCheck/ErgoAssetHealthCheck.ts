import ergoExplorerClientFactory from '@rosen-clients/ergo-explorer';
import { AbstractAssetHealthCheckParam } from './AbstractAssetHealthCheck';
import ergoNodeClientFactory from '@rosen-clients/ergo-node';
import { ERGO_NATIVE_ASSET } from '../../constants';

class ErgoExplorerAssetHealthCheckParam extends AbstractAssetHealthCheckParam {
  private explorerApi;

  constructor(
    assetId: string,
    assetName: string,
    address: string,
    warnThreshold: bigint,
    criticalThreshold: bigint,
    explorerUrl: string,
    assetDecimal = 0
  ) {
    super(
      assetId,
      assetName,
      address,
      warnThreshold,
      criticalThreshold,
      assetDecimal
    );
    this.explorerApi = ergoExplorerClientFactory(explorerUrl);
  }

  /**
   * Updates the asset health status and the update timestamp
   */
  update = async () => {
    let tokenAmount = 0n;
    if (this.assetId == ERGO_NATIVE_ASSET) {
      const assets =
        await this.explorerApi.v1.getApiV1AddressesP1BalanceConfirmed(
          this.address
        );
      if (assets) tokenAmount = assets.nanoErgs;
    } else {
      const assets =
        await this.explorerApi.v1.getApiV1AddressesP1BalanceConfirmed(
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

class ErgoNodeAssetHealthCheckParam extends AbstractAssetHealthCheckParam {
  private nodeApi;

  constructor(
    assetId: string,
    assetName: string,
    address: string,
    warnThreshold: bigint,
    criticalThreshold: bigint,
    nodeUrl: string,
    assetDecimal = 0
  ) {
    super(
      assetId,
      assetName,
      address,
      warnThreshold,
      criticalThreshold,
      assetDecimal
    );
    this.nodeApi = ergoNodeClientFactory(nodeUrl);
  }

  /**
   * Updates the asset health status and the update timestamp
   */
  update = async () => {
    let tokenAmount = 0n;
    if (this.assetId == ERGO_NATIVE_ASSET) {
      const assets = await this.nodeApi.getAddressBalanceTotal(this.address);
      if (assets.confirmed) tokenAmount = assets.confirmed.nanoErgs;
    } else {
      const assets = await this.nodeApi.getAddressBalanceTotal(this.address);
      const token = assets?.confirmed?.tokens.find(
        (token) => token.tokenId == this.assetId
      );
      if (token && token.amount) tokenAmount = token.amount;
    }
    this.tokenAmount = tokenAmount;
    this.updateTimeStamp = new Date();
  };
}

export { ErgoExplorerAssetHealthCheckParam, ErgoNodeAssetHealthCheckParam };
