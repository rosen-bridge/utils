import { AbstractWidHealthCheckParam } from '../../../lib/params/widHealthCheck/AbstractWidHealthCheck';

class TestWidHealthCheckParam extends AbstractWidHealthCheckParam {
  /**
   * mocked update method
   */
  update: () => undefined;

  /**
   * set mocked amount
   * @param amount mocked amount
   */
  setWidStatus = (widStatus: boolean) => {
    this.widExists = widStatus;
  };
}

export { TestWidHealthCheckParam };
