import { NATIVE_RESIDENCY } from './constants';
import { RosenAmount, RosenChainToken, RosenTokens } from './types';

/**
 * TokenMap class searches for different assets properties in different chains
 */
export class TokenMap {
  private tokensConfig: RosenTokens;

  /**
   * it takes input tokens list json and the default value is used for
   *  production
   * @param tokens tokens list as json
   */
  constructor(tokens: RosenTokens) {
    this.tokensConfig = tokens;
  }

  /**
   * Get a list of tokens that can be transferred between specific chains
   * @param fromChain
   * @param toChain
   */
  getTokens = (fromChain: string, toChain: string): Array<RosenChainToken> => {
    return this.tokensConfig.tokens
      .filter(
        (item) => Object.hasOwn(item, fromChain) && Object.hasOwn(item, toChain)
      )
      .map((item) => item[fromChain]);
  };

  /**
   * get a list of all supported network names
   */
  getAllChains = (): Array<string> => {
    return this.tokensConfig.tokens
      .map((item) => Object.keys(item))
      .reduce(
        (allUniqChains, tokenChains) => [
          ...new Set([...allUniqChains, ...tokenChains]),
        ],
        []
      );
  };

  /**
   * get list of all supported chains for specific chain
   * @param sourceChain
   */
  getSupportedChains = (sourceChain: string): Array<string> => {
    return this.tokensConfig.tokens
      .filter((token) => Object.hasOwn(token, sourceChain))
      .map((token) => Object.keys(token))
      .reduce(
        (allChains, newChains) => [...new Set([...allChains, ...newChains])],
        []
      )
      .filter((chain) => chain !== sourceChain);
  };

  /**
   * it returns specific token with respect to condition on the specific chain
   * @param chain
   *  example: "ergo"
   * @param condition
   *  example: {tokenId:"tokenId"}
   */
  search = (chain: string, condition: { [key: string]: string }) => {
    return this.tokensConfig.tokens.filter((token) => {
      if (Object.hasOwnProperty.call(token, chain)) {
        const resToken = token[chain];
        for (const [key, val] of Object.entries(condition)) {
          if (
            !Object.hasOwnProperty.call(resToken, key) ||
            resToken[key] !== val
          ) {
            return false;
          }
        }
        return true;
      } else {
        return false;
      }
    });
  };

  /**
   * returns ID key for specific chain.
   * @param chain: one of supported tokens
   */
  getIdKey = (chain: string): string => {
    if (Object.hasOwnProperty.call(this.tokensConfig.idKeys, chain)) {
      return this.tokensConfig.idKeys[chain];
    }
    throw Error(`chain ${chain} not supported in current config`);
  };

  /**
   * returns tokenId in specific chain with respect to idKeys in the tokensConfig
   * @param token
   *  example: {
   *       "ergo": {
   *         "tokenId": "tokenId",
   *         "tokenName": "token1"
   *       },
   *       "cardano": {
   *         "tokenId": "...",
   *         "policyId": "policy",
   *         "assetName": "id"
   *       }
   *     }
   * @param chain
   *  example: "cardano"
   */
  getID = (
    token: { [key: string]: RosenChainToken },
    chain: string
  ): string => {
    if (Object.hasOwnProperty.call(this.tokensConfig.idKeys, chain)) {
      const idKey = this.tokensConfig.idKeys[chain];
      return token[chain][idKey] as string;
    } else {
      throw new Error(
        `idKey of the ${chain} chain is missed in the config file`
      );
    }
  };

  /**
   * return all native tokens for a specific chain.
   * @param chain: one of supported chains
   */
  getAllNativeTokens = (chain: string): RosenChainToken[] => {
    return this.tokensConfig.tokens
      .filter(
        (token) =>
          Object.hasOwn(token, chain) &&
          token[chain].metaData.residency == NATIVE_RESIDENCY
      )
      .map((token) => token[chain]);
  };

  /**
   * get a token set by the id of one of them
   * @param tokenId
   */
  getTokenSet = (
    tokenId: string
  ): Record<string, RosenChainToken> | undefined => {
    const result = this.tokensConfig.tokens.filter(
      (tokenSet) =>
        Object.keys(tokenSet).filter(
          (chain) => tokenSet[chain][this.getIdKey(chain)] === tokenId
        ).length
    );
    if (result.length === 0) return undefined;
    return result[0];
  };

  /**
   * wraps amount of a token on the given chain
   * @param tokenId
   * @param amount
   * @param chain
   */
  wrapAmount = (
    tokenId: string,
    amount: bigint,
    chain: string
  ): RosenAmount => {
    const tokens = this.getTokenSet(tokenId);

    if (tokens === undefined) {
      // token is not supported, no decimals drop
      return {
        amount: amount,
        decimals: 0,
      };
    } else {
      const significantDecimals = Math.min(
        ...Object.keys(tokens).map(
          (supportedChain) => tokens[supportedChain].decimals
        )
      );
      const result =
        amount / BigInt(10 ** (tokens[chain].decimals - significantDecimals));
      return {
        amount: result,
        decimals: significantDecimals,
      };
    }
  };

  /**
   * wraps amount of a token on the given chain
   * @param tokenId
   * @param amount
   * @param toChain
   */
  unwrapAmount = (
    tokenId: string,
    amount: bigint,
    toChain: string
  ): RosenAmount => {
    const tokens = this.getTokenSet(tokenId);

    if (tokens === undefined) {
      // token is not supported, no decimals added
      return {
        amount: amount,
        decimals: 0,
      };
    } else {
      const significantDecimals = Math.min(
        ...Object.keys(tokens).map((chain) => tokens[chain].decimals)
      );
      const result =
        amount * BigInt(10 ** (tokens[toChain].decimals - significantDecimals));
      return {
        amount: result,
        decimals: tokens[toChain].decimals,
      };
    }
  };
}
