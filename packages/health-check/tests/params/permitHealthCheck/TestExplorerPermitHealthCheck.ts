import { ExplorerPermitHealthCheckParam } from '../../../lib/params/permitHealthCheck/ExplorerPermitHealthCheck';

class TestExplorerPermitHealthCheck extends ExplorerPermitHealthCheckParam {
  /**
   * @returns protected token amount
   */
  getReportCount = () => {
    return this.reportCount;
  };
}

export { TestExplorerPermitHealthCheck };
