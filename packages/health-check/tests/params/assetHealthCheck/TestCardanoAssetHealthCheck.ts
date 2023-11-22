import {
  CardanoKoiosAssetHealthCheckParam,
  CardanoBlockFrostAssetHealthCheckParam,
} from '../../../lib/params/assetHealthCheck/CardanoAssetHealthCheck';

class TestCardanoKoiosAssetHealthCheck extends CardanoKoiosAssetHealthCheckParam {
  /**
   * @returns protected token amount
   */
  getTokenAmount = () => {
    return this.tokenAmount;
  };
}

class TestCardanoBlockFrostAssetHealthCheck extends CardanoBlockFrostAssetHealthCheckParam {
  /**
   * @returns protected token amount
   */
  getTokenAmount = () => {
    return this.tokenAmount;
  };
}

export {
  TestCardanoKoiosAssetHealthCheck,
  TestCardanoBlockFrostAssetHealthCheck,
};
