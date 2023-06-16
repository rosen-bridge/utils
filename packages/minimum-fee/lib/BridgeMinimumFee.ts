import { ChainFee, Fee, FeeConfig, ConfigBox } from './types';
import { ErgoBox } from 'ergo-lib-wasm-nodejs';
import { JsonBI, extractConfigRegisters, isConfigDefined } from './parser';
import { API_PAGE_LIMIT, Consts } from './consts';
import ergoExplorerClientFactory from '@rosen-clients/ergo-explorer';

export class BridgeMinimumFee {
  protected readonly explorerClient: ReturnType<
    typeof ergoExplorerClientFactory
  >;
  protected readonly feeConfigTokenId: string;
  readonly ratioDivisor: bigint = 1000000000000n;
  readonly feeRatioDivisor: bigint = 10000n;

  /**
   * initializes class parameters
   * @param explorerBaseUrl base url to explorer api
   * @param feeConfigTokenId the token id which all minimum fee config boxes contain
   */
  constructor(explorerBaseUrl: string, feeConfigTokenId: string) {
    this.explorerClient = ergoExplorerClientFactory(explorerBaseUrl);
    this.feeConfigTokenId = feeConfigTokenId;
  }

  /**
   * finds and returns minimum fee config for given token id
   * @param tokenId the token id
   */
  search = async (tokenId: string): Promise<FeeConfig> => {
    try {
      // get config box from Explorer
      let page = 0;
      let configs: ConfigBox = {
        bridgeFees: undefined,
        chains: undefined,
        heights: undefined,
        networkFees: undefined,
        rsnRatios: undefined,
        feeRatios: undefined,
      };
      for (;;) {
        const boxes = (
          await this.explorerClient.v1.getApiV1BoxesUnspentBytokenidP1(
            this.feeConfigTokenId,
            {
              offset: page++,
              limit: API_PAGE_LIMIT,
            }
          )
        ).items;
        if (!boxes?.length) break;
        for (let i = 0; i < boxes.length; i++) {
          const ergoBox = ErgoBox.from_json(JsonBI.stringify(boxes[i]));
          if (
            (ergoBox.tokens().len() === 1 && tokenId === Consts.ergTokenName) ||
            (ergoBox.tokens().len() === 2 &&
              tokenId === ergoBox.tokens().get(1).id().to_str())
          ) {
            const localConfigs = extractConfigRegisters(ergoBox);
            if (isConfigDefined(localConfigs)) {
              configs = localConfigs;
              break;
            }
          }
        }
        if (configs.chains !== undefined) {
          break;
        }
      }

      // appropriate log or error for suspects cases
      const { chains, heights, bridgeFees, networkFees, rsnRatios, feeRatios } =
        configs;
      if (
        chains === undefined ||
        heights === undefined ||
        bridgeFees === undefined ||
        networkFees === undefined ||
        rsnRatios === undefined ||
        feeRatios === undefined
      )
        throw Error(`Found no config box`);

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
            feeRatio: BigInt(feeRatios[i][j]),
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
