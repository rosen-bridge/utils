import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import { ErgoBoxWrapper } from '../types';

abstract class AbstractMinimumFeeNetwork {
  logger: AbstractLogger;

  constructor(logger?: AbstractLogger) {
    this.logger = logger ? logger : new DummyLogger();
  }

  /**
   * gets the boxes by token id
   * @returns promise that resolves to an array of ErgoBoxWrapper objects
   */
  abstract getBoxesByTokenId: (tokenId: string) => Promise<ErgoBoxWrapper[]>;
}

export default AbstractMinimumFeeNetwork;
