import { ErgoBoxWrapper, MinimumFeeBox } from '../lib';

export class TestMinimumFeeBox extends MinimumFeeBox {
  /**
   * sets ErgoBox
   * @param box
   */
  setBox = (box: ErgoBoxWrapper): void => {
    this.box = box;
  };

  /**
   * calls selectEligibleBox function
   * @param eligibleBoxes
   */
  callSelectEligibleBox = (
    eligibleBoxes: Array<ErgoBoxWrapper>,
  ): ErgoBoxWrapper => this.selectEligibleBox(eligibleBoxes);
}
