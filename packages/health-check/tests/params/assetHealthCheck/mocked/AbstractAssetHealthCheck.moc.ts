import { AbstractAssetHealthCheckParam } from '../../../../lib/params/assetHealthCheck/AbstractAssetHealthCheck';

class TestAssetHealthCheckParam extends AbstractAssetHealthCheckParam {
  /**
   * mocked update method
   */
  update: () => undefined;

  /**
   * set mocked amount
   * @param amount mocked amount
   */
  setTokenAmount = (amount: bigint) => {
    this.tokenAmount = amount;
  };
}

export { TestAssetHealthCheckParam };
