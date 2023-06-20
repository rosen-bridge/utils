import { AbstractScannerSyncHealthCheckParam } from '../../../lib/params/scannerSyncHealthCheck/AbstractScannerSyncHealthCheck';

class TestScannerHealthCheckParam extends AbstractScannerSyncHealthCheckParam {
  /**
   * mocked update method
   */
  getLastAvailableBlock = async () => {
    return 1115;
  };

  /**
   * set mocked difference
   * @param difference mocked difference
   */
  setDifference = (difference: number) => {
    this.difference = difference;
  };

  /**
   * @returns protected height difference
   */
  getDifference = () => {
    return this.difference;
  };
}

export { TestScannerHealthCheckParam };
