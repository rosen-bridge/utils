import { NodePermitHealthCheckParam } from '../../../lib/params/permitHealthCheck/NodePermitHealthCheck';

class TestNodePermitHealthCheck extends NodePermitHealthCheckParam {
  /**
   * @returns protected token amount
   */
  getRWTCount = () => {
    return this.RWTCount;
  };
}

export { TestNodePermitHealthCheck };
