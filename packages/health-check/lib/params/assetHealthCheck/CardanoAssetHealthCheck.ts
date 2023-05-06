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
    koiosUrl: string
  ) {
    super(assetId, assetName, address, warnThreshold, criticalThreshold);
    this.koiosApi = cardanoKoiosClientFactory(koiosUrl);
  }

  /**
   * Updates the asset health status and the update timestamp
   */
  update = async () => {
    let tokenAmount = 0n;
    if (this.assetId == CARDANO_NATIVE_ASSET) {
      const infos = await this.koiosApi.address.postAddressInfo({
        _addresses: [this.address],
      });
      if (infos[0].balance) tokenAmount = BigInt(infos[0].balance);
    } else {
      const assets = await this.koiosApi.address.postAddressAssets({
        _addresses: [this.address],
      });
      const token = assets[0].asset_list?.find(
        (token) => token.fingerprint == this.assetId
      );
      if (token && token.quantity) tokenAmount = BigInt(token.quantity);
    }

    this.tokenAmount = tokenAmount;
    this.updateTimeStamp = new Date();
  };
}

export { CardanoAssetHealthCheckParam };
