import { AbstractScannerSyncHealthCheckParam } from '../../../lib/params/scannerSyncHealthCheck/AbstractScannerSyncHealthCheck';

class TestScannerHealthCheckParam extends AbstractScannerSyncHealthCheckParam {
  /**
   * mocked update method
   */
  update: () => undefined;

  /**
   * set mocked difference
   * @param difference mocked difference
   */
  setDifference = (difference: number) => {
    this.difference = difference;
  };
}

export { TestScannerHealthCheckParam };
