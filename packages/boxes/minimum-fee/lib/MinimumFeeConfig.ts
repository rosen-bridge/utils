import { ChainFee, Fee } from './types';

export class MinimumFeeConfig {
  protected fee: Fee;

  constructor() {
    this.fee = {
      heights: {},
      configs: {},
    };
  }

  /**
   * adds fee for a chain
   * @param chain
   * @param height
   * @param chainFee
   */
  addChainConfig = (
    chain: string,
    height: number,
    chainFee: ChainFee | undefined
  ): MinimumFeeConfig => {
    this.fee.heights[chain] = height;
    if (chainFee) this.fee.configs[chain] = chainFee;
    return this;
  };

  /**
   * removes fee for a chain
   * @param chain
   */
  removeChainConfig = (chain: string): MinimumFeeConfig => {
    delete this.fee.heights[chain];
    delete this.fee.configs[chain];
    return this;
  };

  /**
   * returns generated fee
   */
  getConfig = (): Fee => {
    return this.fee;
  };
}
