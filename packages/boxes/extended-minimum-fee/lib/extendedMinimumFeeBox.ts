import { Address, ErgoTree, NetworkPrefix } from 'ergo-lib-wasm-nodejs';

import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import JsonBigInt from '@rosen-bridge/json-bigint';
import {
  AbstractMinimumFeeNetwork,
  MinimumFeeBox,
  MinimumFeeConfig,
} from '@rosen-bridge/minimum-fee';

import { MinimumFeeBoxBuilder } from './minimumFeeBoxBuilder';
import { decodeRegister } from './utils';

export class ExtendedMinimumFeeBox extends MinimumFeeBox {
  constructor(
    tokenId: string,
    minimumFeeNFT: string,
    network: AbstractMinimumFeeNetwork,
    logger?: AbstractLogger,
  ) {
    super(tokenId, minimumFeeNFT, network, decodeRegister, logger);
  }

  /**
   * generates a MinimumFeeBoxBuilder using current box
   *  note that 'height' parameter of builder won't be set
   */
  toBuilder = (): MinimumFeeBoxBuilder => {
    if (!this.box) throw Error(`Box is not fetched yet`);

    const builder = new MinimumFeeBoxBuilder(
      this.minimumFeeNFT,
      Address.recreate_from_ergo_tree(
        ErgoTree.from_base16_bytes(this.box.ergoTree),
      ).to_base58(NetworkPrefix.Mainnet),
    )
      .setValue(this.box.value)
      .setToken(this.tokenId);

    this.getConfigs().forEach((fee) => {
      this.logger.debug(
        `Extracted fee config from box [${this.box!.boxId}]: ${JsonBigInt.stringify(
          fee,
        )}`,
      );
      const chainFee = new MinimumFeeConfig();
      Object.keys(fee.heights).forEach((chain) => {
        if (Object.hasOwn(fee.configs, chain))
          chainFee.setChainConfig(
            chain,
            fee.heights[chain],
            fee.configs[chain],
          );
        else chainFee.setChainConfig(chain, fee.heights[chain], undefined);
      });
      builder.addConfig(chainFee);
    });
    return builder;
  };
}
