import {
  Address,
  BoxValue,
  Contract,
  ErgoBoxCandidateBuilder,
  I64,
  TokenAmount,
  TokenId,
  Constant,
  ErgoBoxCandidate,
} from 'ergo-lib-wasm-nodejs';
import { MinimumFeeConfig } from './MinimumFeeConfig';
import { Fee } from './types';
import { InvalidConfig } from './errors';
import { ERGO_NATIVE_TOKEN } from './constants';

export class MinimumFeeBoxBuilder {
  protected fees: Array<Fee>;
  protected boxValue: BoxValue;
  protected boxheight: number;
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
    this.fees.splice(index);
    return this;
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
    this.boxheight = currentHeight;
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
    if (!this.boxheight)
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
   * validates specified configs and builds ErgoBoxCandidate of config box using them
   */
  build = (): ErgoBoxCandidate => {
    this.validate();

    // add box value, address and creation height
    const boxBuilder = new ErgoBoxCandidateBuilder(
      this.boxValue,
      Contract.new(Address.from_base58(this.address).to_ergo_tree()),
      this.boxheight
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
    //  extract chains
    const chains: Array<string> = [];
    this.fees.forEach((fee) => {
      Object.keys(fee.heights).forEach((feeChain) => {
        if (!chains.includes(feeChain)) chains.push(feeChain);
      });
    });
    chains.sort();
    //  extract configs
    const heights: Array<Array<number>> = [];
    const brdigeFees: Array<Array<string>> = [];
    const networkFees: Array<Array<string>> = [];
    const rsnRatios: Array<Array<Array<string>>> = [];
    const feeRatios: Array<Array<string>> = [];
    this.fees.forEach((fee) => {
      const heightsConfigs: Array<number> = [];
      const brdigeFeesConfigs: Array<string> = [];
      const networkFeesConfigs: Array<string> = [];
      const rsnRatiosConfigs: Array<Array<string>> = [];
      const feeRatiosConfigs: Array<string> = [];

      chains.forEach((chain) => {
        if (Object.hasOwn(fee.heights, chain))
          heightsConfigs.push(fee.heights[chain]);
        else heightsConfigs.push(-1);

        if (Object.hasOwn(fee.configs, chain)) {
          brdigeFeesConfigs.push(fee.configs[chain].bridgeFee.toString());
          networkFeesConfigs.push(fee.configs[chain].networkFee.toString());
          rsnRatiosConfigs.push([
            fee.configs[chain].rsnRatio.toString(),
            fee.configs[chain].rsnRatioDivisor.toString(),
          ]);
          feeRatiosConfigs.push(fee.configs[chain].feeRatio.toString());
        } else {
          brdigeFeesConfigs.push('-1');
          networkFeesConfigs.push('-1');
          rsnRatiosConfigs.push(['-1', '-1']);
          feeRatiosConfigs.push('-1');
        }
      });

      heights.push(heightsConfigs);
      brdigeFees.push(brdigeFeesConfigs);
      networkFees.push(networkFeesConfigs);
      rsnRatios.push(rsnRatiosConfigs);
      feeRatios.push(feeRatiosConfigs);
    });

    // add box registers
    boxBuilder.set_register_value(
      4,
      Constant.from_coll_coll_byte(chains.map((chain) => Buffer.from(chain)))
    );
    boxBuilder.set_register_value(5, Constant.from_js(heights));
    boxBuilder.set_register_value(6, Constant.from_js(brdigeFees));
    boxBuilder.set_register_value(7, Constant.from_js(networkFees));
    boxBuilder.set_register_value(8, Constant.from_js(rsnRatios));
    boxBuilder.set_register_value(9, Constant.from_js(feeRatios));

    return boxBuilder.build();
  };
}
