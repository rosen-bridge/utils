import { CARDANO_NATIVE_ASSET } from '../../constants';
import { AbstractAssetHealthCheckParam } from './AbstractAssetHealthCheck';
import cardanoKoiosClientFactory from '@rosen-clients/cardano-koios';

class CardanoAssetHealthCheckParam extends AbstractAssetHealthCheckParam {
  private koiosApi;

  constructor(
    assetId: string,
    assetName: string,
    address: string,
    warnThreshold: bigint,
    criticalThreshold: bigint,
    koiosUrl: string,
    assetDecimal = 0,
    authToken?: string
  ) {
    super(
      assetId,
      assetName,
      address,
      warnThreshold,
      criticalThreshold,
      assetDecimal
    );
    this.koiosApi = cardanoKoiosClientFactory(koiosUrl, authToken);
  }

  /**
   * Updates the asset health status and the update timestamp
   */
  update = async () => {
    let tokenAmount = 0n;
    if (this.assetId == CARDANO_NATIVE_ASSET) {
      const infos = await this.koiosApi.postAddressInfo({
        _addresses: [this.address],
      });
      if (infos[0].balance) tokenAmount = BigInt(infos[0].balance);
    } else {
      const assets = await this.koiosApi.postAddressAssets({
        _addresses: [this.address],
      });
      const token = assets.find((token) => token.fingerprint == this.assetId);
      if (token && token.quantity) tokenAmount = BigInt(token.quantity);
    }

    this.tokenAmount = tokenAmount;
    this.updateTimeStamp = new Date();
  };
}

export { CardanoAssetHealthCheckParam };
