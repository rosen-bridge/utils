import { ExplorerWidHealthCheckParam } from '../../../lib';

class TestExplorerWidHealthCheck extends ExplorerWidHealthCheckParam {
  /**
   * @returns protected token amount
   */
  getWidStatus = () => {
    return this.widExists;
  };
}

export { TestExplorerWidHealthCheck };
