import { AbstractAssetHealthCheckParam } from '../../../lib/params/AbstractAssetHealthCheck';

class TestAssetHealthCheckParam extends AbstractAssetHealthCheckParam {
  /**
   * mocked update method
   */
  update: () => undefined;
}

export { TestAssetHealthCheckParam };
