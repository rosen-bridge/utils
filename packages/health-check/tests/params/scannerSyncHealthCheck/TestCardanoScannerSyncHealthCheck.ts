import { CardanoScannerHealthCheck } from '../../../lib';

class TestCardanoScannerHealthCheck extends CardanoScannerHealthCheck {
  /**
   * @returns protected height difference
   */
  getDifference = () => {
    return this.difference;
  };
}

export { TestCardanoScannerHealthCheck };
