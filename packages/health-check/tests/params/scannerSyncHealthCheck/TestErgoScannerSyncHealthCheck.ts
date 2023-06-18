import {
  ErgoExplorerScannerHealthCheck,
  ErgoNodeScannerHealthCheck,
} from '../../../lib';

class TestErgoExplorerScannerHealthCheck extends ErgoExplorerScannerHealthCheck {
  /**
   * @returns protected height difference
   */
  getDifference = () => {
    return this.difference;
  };
}

class TestErgoNodeScannerHealthCheck extends ErgoNodeScannerHealthCheck {
  /**
   * @returns protected height difference
   */
  getDifference = () => {
    return this.difference;
  };
}

export { TestErgoNodeScannerHealthCheck, TestErgoExplorerScannerHealthCheck };
