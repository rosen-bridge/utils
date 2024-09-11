import {
  Address,
  BoxValue,
  Contract,
  ErgoBoxCandidateBuilder,
  I64,
  TokenAmount,
  TokenId,
  ErgoBoxCandidate,
} from 'ergo-lib-wasm-nodejs';
import { MinimumFeeConfig } from './MinimumFeeConfig';
import { Fee } from './types';
import { InvalidConfig } from './errors';
import { ERGO_NATIVE_TOKEN } from './constants';
import { feeToRegisterValues } from './utils';

export class MinimumFeeBoxBuilder {
  protected fees: Array<Fee>;
  protected boxValue: BoxValue;
  protected boxHeight: number;
  protected tokenId: string;
  protected minimumFeeNFT: string;
  protected address: string;

  constructor(minimumFeeNFT: string, address: string) {
    this.fees = [];
    this.minimumFeeNFT = minimumFeeNFT;
    this.address = address;
  }

  /**
   * adds a feeConfig
   * @param feeConfig
   */
  addConfig = (feeConfig: MinimumFeeConfig): MinimumFeeBoxBuilder => {
    this.fees.push(feeConfig.getConfig());
    return this;
  };

  /**
   * removes a config by index
   * @param index
   */
  removeConfig = (index: number): MinimumFeeBoxBuilder => {
    this.fees.splice(index, 1);
    return this;
  };

  /**
   * gets current feeConfig
   */
  getConfigs = (): Array<Fee> => {
    return this.fees;
  };

  /**
   * sets ErgoBox Erg value
   * @param nanoErg
   * @returns
   */
  setValue = (nanoErg: bigint): MinimumFeeBoxBuilder => {
    this.boxValue = BoxValue.from_i64(I64.from_str(nanoErg.toString()));
    return this;
  };

  /**
   * sets ErgoBox creationheight
   * @param currentHeight
   */
  setHeight = (currentHeight: number): MinimumFeeBoxBuilder => {
    this.boxHeight = currentHeight;
    return this;
  };

  /**
   * sets config token id
   * @param tokenId
   */
  setToken = (tokenId: string): MinimumFeeBoxBuilder => {
    this.tokenId = tokenId;
    return this;
  };

  /**
   * validates some of specified configs
   */
  protected validate = (): void => {
    if (!this.boxValue)
      throw new InvalidConfig(`Box value argument is not defined`);
    if (!this.boxHeight)
      throw new InvalidConfig(`Box creation height argument is not defined`);
    if (!this.tokenId)
      throw new InvalidConfig(`Config token id is not defined`);
    if (this.fees.length === 0)
      throw new InvalidConfig(
        `No config added. Please add at least one config`
      );

    for (let i = 0; i < this.fees.length - 1; i++) {
      const chains = Object.keys(this.fees[0].heights);
      chains.forEach((chain) => {
        if (!this.fees[i + 1].heights[chain])
          throw new InvalidConfig(
            `Expected chain [${chain}] at index [${i + 1}]`
          );
        if (this.fees[i + 1].heights[chain] < this.fees[i].heights[chain])
          throw new InvalidConfig(
            `All heights for a chain should be ascending. Heights of chain [${chain}] at indexes [${i},${
              i + 1
            }] are invalid [${this.fees[i + 1].heights[chain]} < ${
              this.fees[i].heights[chain]
            }]`
          );
      });
    }
  };

  /**
   * removes heights and configs of all chains which don't have any configs
   */
  prune = (): MinimumFeeBoxBuilder => {
    const activeChains: string[] = [];

    for (let i = 0; i < this.fees.length; i++) {
      const chains = Object.keys(this.fees[i].heights);
      chains.forEach((chain) => {
        const feeConfig = this.fees[i].configs[chain];
        if (
          feeConfig &&
          (feeConfig.bridgeFee !== -1n ||
            feeConfig.networkFee !== -1n ||
            feeConfig.rsnRatio !== -1n ||
            feeConfig.rsnRatioDivisor !== -1n ||
            feeConfig.feeRatio !== -1n)
        )
          activeChains.push(chain);
      });
    }

    for (let i = 0; i < this.fees.length; i++) {
      const chains = Object.keys(this.fees[i].heights);
      chains.forEach((chain) => {
        if (!activeChains.includes(chain)) {
          delete this.fees[i].heights[chain];
          delete this.fees[i].configs[chain];
        }
      });
    }

    return this;
  };

  /**
   * validates specified configs and builds ErgoBoxCandidate of config box using them
   */
  build = (): ErgoBoxCandidate => {
    this.validate();

    // add box value, address and creation height
    const boxBuilder = new ErgoBoxCandidateBuilder(
      this.boxValue,
      Contract.new(Address.from_base58(this.address).to_ergo_tree()),
      this.boxHeight
    );

    // add box tokens
    boxBuilder.add_token(
      TokenId.from_str(this.minimumFeeNFT),
      TokenAmount.from_i64(I64.from_str('1'))
    );
    if (this.tokenId !== ERGO_NATIVE_TOKEN)
      boxBuilder.add_token(
        TokenId.from_str(this.tokenId),
        TokenAmount.from_i64(I64.from_str('1'))
      );

    // generate register values
    const registerValues = feeToRegisterValues(this.fees);

    // add box registers
    boxBuilder.set_register_value(4, registerValues.R4);
    boxBuilder.set_register_value(5, registerValues.R5);
    boxBuilder.set_register_value(6, registerValues.R6);
    boxBuilder.set_register_value(7, registerValues.R7);
    boxBuilder.set_register_value(8, registerValues.R8);
    boxBuilder.set_register_value(9, registerValues.R9);

    return boxBuilder.build();
  };
}
