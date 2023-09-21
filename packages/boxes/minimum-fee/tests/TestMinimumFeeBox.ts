import { ErgoBox } from 'ergo-lib-wasm-nodejs';
import { MinimumFeeBox } from '../lib';

export class TestMinimumFeeBox extends MinimumFeeBox {
  /**
   * calls selectEligibleBox function
   * @param eligibleBoxes
   */
  callSelectEligibleBox = (eligibleBoxes: Array<ErgoBox>): ErgoBox =>
    this.selectEligibleBox(eligibleBoxes);
}
