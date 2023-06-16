import { AbstractPermitHealthCheckParam } from '../../../lib/params/permitHealthCheck/AbstractPermitHealthCheck';

class TestPermitHealthCheckParam extends AbstractPermitHealthCheckParam {
  /**
   * mocked update method
   */
  update: () => undefined;

  /**
   * set mocked amount
   * @param amount mocked amount
   */
  setRWTAmount = (amount: bigint) => {
    this.RWTCount = amount;
  };
}

export { TestPermitHealthCheckParam };
