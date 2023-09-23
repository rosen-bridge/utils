import { ErgoBox } from 'ergo-lib-wasm-nodejs';
import { MinimumFeeBox } from '../lib';

export class TestMinimumFeeBox extends MinimumFeeBox {
  /**
   * sets ErgoBox
   * @param box
   */
  setBox = (box: ErgoBox): void => {
    this.box = box;
  };

  /**
   * calls selectEligibleBox function
   * @param eligibleBoxes
   */
  callSelectEligibleBox = (eligibleBoxes: Array<ErgoBox>): ErgoBox =>
    this.selectEligibleBox(eligibleBoxes);
}
