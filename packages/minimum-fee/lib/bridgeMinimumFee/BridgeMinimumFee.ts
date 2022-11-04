import ExplorerApi from '../network/ExplorerApi';
import { ChainFee, Fee, FeeConfig } from './types';
import { ErgoBox } from 'ergo-lib-wasm-browser';
import { JsonBI } from '../network/parser';

export class BridgeMinimumFee {
  protected readonly explorer: ExplorerApi;
  protected readonly feeConfigErgoTreeTemplateHash: string;
  protected readonly feeConfigTokenId: string;
  readonly ratioDivisor: bigint = BigInt(100000);

  /**
   * initializes class parameters
   * @param explorerBaseUrl base url to explorer api
   * @param feeConfigErgoTreeTemplateHash the ergoTreeTemplateHash of all minimum fee config boxes
   * @param feeConfigTokenId the token id which all minimum fee config boxes contain
   */
  constructor(
    explorerBaseUrl: string,
    feeConfigErgoTreeTemplateHash: string,
    feeConfigTokenId: string
  ) {
    this.explorer = new ExplorerApi(explorerBaseUrl);
    this.feeConfigErgoTreeTemplateHash = feeConfigErgoTreeTemplateHash;
    this.feeConfigTokenId = feeConfigTokenId;
  }

  /**
   * finds and returns minimum fee config for given token id
   * @param tokenId the token id
   */
  search = async (tokenId: string): Promise<FeeConfig> => {
    try {
      // get config box from Explorer
      const boxes = await this.explorer.boxSearch(
        this.feeConfigErgoTreeTemplateHash,
        [this.feeConfigTokenId, tokenId]
      );
      // appropriate log or error for suspects cases
      if (boxes.total < 1) throw Error(`Found no config box`);
      if (boxes.total > 1)
        throw Error(
          `Found more than one config box. Ids: ${boxes.items.map(
            (box) => box.boxId
          )}`
        );

      // convert box to ErgoBox
      const box = ErgoBox.from_json(JsonBI.stringify(boxes.items[0]));

      // get registers data
      const chains = box.register_value(4)?.to_coll_coll_byte();
      const heights: Array<Array<string>> | undefined = box
        .register_value(5)
        ?.to_js();
      const bridgeFees: Array<Array<string>> | undefined = box
        .register_value(6)
        ?.to_js();
      const networkFees: Array<Array<string>> | undefined = box
        .register_value(7)
        ?.to_js();
      const rsnRatios: Array<Array<string>> | undefined = box
        .register_value(8)
        ?.to_js();

      // throw error if any registers is undefined
      if (chains === undefined)
        throw Error(`Box [${box.box_id().to_str()}] has no config in R4`);
      if (heights === undefined)
        throw Error(`Box [${box.box_id().to_str()}] has no config in R5`);
      if (bridgeFees === undefined)
        throw Error(`Box [${box.box_id().to_str()}] has no config in R6`);
      if (networkFees === undefined)
        throw Error(`Box [${box.box_id().to_str()}] has no config in R7`);
      if (rsnRatios === undefined)
        throw Error(`Box [${box.box_id().to_str()}] has no config in R8`);

      // create json of config
      const config: FeeConfig = {};
      for (let i = 0; i < chains.length; i++) {
        const chain = Buffer.from(chains[i]).toString();

        const chainConfig: ChainFee = {};
        for (let j = 0; j < heights[i].length; j++) {
          const height = heights[i][j];

          chainConfig[height] = {
            bridgeFee: BigInt(bridgeFees[i][j]),
            networkFee: BigInt(networkFees[i][j]),
            rsnRatio: BigInt(rsnRatios[i][j]),
          };
        }

        config[chain] = chainConfig;
      }

      return config;
    } catch (e) {
      throw Error(
        `An error occurred while getting config for token [${tokenId}]: ${e}`
      );
    }
  };

  /**
   * returns minimum fee config for given token on given chain and height
   * @param tokenId the token id
   * @param chain the given chain
   * @param height the given height
   */
  getFee = async (
    tokenId: string,
    chain: string,
    height: number
  ): Promise<Fee> => {
    const feeConfig = await this.search(tokenId);

    if (chain in feeConfig) {
      const heights = Object.keys(feeConfig[chain]);
      heights.sort();
      heights.reverse();
      for (const configHeight of heights) {
        if (height >= Number(configHeight))
          return feeConfig[chain][configHeight];
      }
      throw Error(
        `Failed to get token minimum config: found no config for token [${tokenId}] in chain [${chain}] on height [${height}]`
      );
    } else
      throw Error(
        `Failed to get token minimum config: token [${tokenId}] has no config for chain [${chain}]`
      );
  };
}
