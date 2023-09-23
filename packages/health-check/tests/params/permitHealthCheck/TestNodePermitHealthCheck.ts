import { NodePermitHealthCheckParam } from '../../../lib/params/permitHealthCheck/NodePermitHealthCheck';

class TestNodePermitHealthCheck extends NodePermitHealthCheckParam {
  /**
   * @returns protected report count
   */
  getReportCount = () => {
    return this.reportsCount;
  };
}

export { TestNodePermitHealthCheck };
