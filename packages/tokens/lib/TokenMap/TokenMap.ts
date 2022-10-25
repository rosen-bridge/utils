import { RosenTokens } from './types';

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
   * it returns specific token with respect to condition on the specific chain
   * @param chain
   *  example: "ergo"
   * @param condition
   *  example: {tokenID:"tokenID"}
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
   *         "tokenID": "tokenId",
   *         "tokenName": "token1"
   *       },
   *       "cardano": {
   *         "fingerprint": "...",
   *         "policyID": "policy",
   *         "assetID": "id"
   *       }
   *     }
   * @param chain
   *  example: "cardano"
   */
  getID = (
    token: { [key: string]: { [key: string]: string } },
    chain: string
  ): string => {
    if (Object.hasOwnProperty.call(this.tokensConfig.idKeys, chain)) {
      const idKey = this.tokensConfig.idKeys[chain];
      return token[chain][idKey];
    } else {
      throw new Error(
        `idKey of the ${chain} chain is missed in the config file`
      );
    }
  };
}
