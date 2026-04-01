import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import {
  AbstractMinimumFeeNetwork,
  ErgoBoxWrapper,
} from '@rosen-bridge/minimum-fee';

import { ExtendedMinimumFeeBox } from '../lib';

export class TestExtendedMinimumFeeBox extends ExtendedMinimumFeeBox {
  constructor(
    tokenId: string,
    minimumFeeNFT: string,
    network: AbstractMinimumFeeNetwork,
    logger?: AbstractLogger,
  ) {
    super(tokenId, minimumFeeNFT, network, logger);
  }

  /**
   * sets ErgoBox
   * @param box
   */
  setBox = (box: ErgoBoxWrapper): void => {
    this.box = box;
  };
}
