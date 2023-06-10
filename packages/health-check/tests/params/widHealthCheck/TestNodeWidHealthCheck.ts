import { NodeWidHealthCheckParam } from '../../../lib/params/widHealthCheck/NodeWidHealthCheck';

class TestNodeWidHealthCheck extends NodeWidHealthCheckParam {
  /**
   * @returns protected token amount
   */
  getWidStatus = () => {
    return this.widExists;
  };
}

export { TestNodeWidHealthCheck };
