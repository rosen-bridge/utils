import { CardanoAssetHealthCheckParam } from '../../../lib/params/assetHealthCheck/CardanoAssetHealthCheck';

class TestCardanoAssetHealthCheck extends CardanoAssetHealthCheckParam {
  /**
   * @returns protected token amount
   */
  getTokenAmount = () => {
    return this.tokenAmount;
  };
}

export { TestCardanoAssetHealthCheck };
