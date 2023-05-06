import { ExplorerPermitHealthCheckParam } from '../../../lib/params/permitHealthCheck/ExplorerPermitHealthCheck';

class TestExplorerPermitHealthCheck extends ExplorerPermitHealthCheckParam {
  /**
   * @returns protected token amount
   */
  getRWTCount = () => {
    return this.RWTCount;
  };
}

export { TestExplorerPermitHealthCheck };
