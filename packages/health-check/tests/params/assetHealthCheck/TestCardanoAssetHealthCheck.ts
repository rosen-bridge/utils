import {
  CardanoAssetHealthCheckParam,
  CardanoBlockFrostAssetHealthCheckParam,
} from '../../../lib/params/assetHealthCheck/CardanoAssetHealthCheck';

class TestCardanoAssetHealthCheck extends CardanoAssetHealthCheckParam {
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

export { TestCardanoAssetHealthCheck, TestCardanoBlockFrostAssetHealthCheck };
