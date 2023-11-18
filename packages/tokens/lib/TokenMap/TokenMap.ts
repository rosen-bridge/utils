import { RosenChainToken, RosenTokens } from './types';

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
}
