import {
  CardanoKoiosAssetHealthCheckParam,
  CardanoBlockFrostAssetHealthCheckParam,
  CardanoGraphQLAssetHealthCheckParam,
} from '../../../lib';

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

class TestCardanoGraphQLAssetHealthCheck extends CardanoGraphQLAssetHealthCheckParam {
  /**
   * @returns protected token amount
   */
  getTokenAmount = () => {
    return this.tokenAmount;
  };

  /**
   * @returns the apollo client
   */
  getClient = () => this.client;
}

export {
  TestCardanoKoiosAssetHealthCheck,
  TestCardanoBlockFrostAssetHealthCheck,
  TestCardanoGraphQLAssetHealthCheck,
};
