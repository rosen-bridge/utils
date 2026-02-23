import { Semaphore } from 'await-semaphore';

import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';

import { ERGO_CHAIN, NATIVE_RESIDENCY } from './constants';
import { CorruptedConfigError } from './errors';
import {
  CallbackFunction,
  RosenAmount,
  RosenChainToken,
  RosenTokens,
} from './types';

/**
 * TokenMap class searches for different assets properties in different chains
 */
export class TokenMap {
  protected tokensConfig: RosenTokens;
  protected unbridgeableTokens: RosenTokens;
  protected updateSemaphore: Semaphore;
  protected callbacks: Map<number, CallbackFunction>;
  protected logger: AbstractLogger;
  protected nextCallbackId: number;

  constructor(logger?: AbstractLogger) {
    this.tokensConfig = [];
    this.unbridgeableTokens = [];
    this.updateSemaphore = new Semaphore(1);
    this.callbacks = new Map<number, CallbackFunction>();
    this.logger = logger ?? new DummyLogger();
    this.nextCallbackId = 0;
  }

  /**
   * registers a callback function
   * @param callback function to be called
   * @returns the ID of the registered callback
   */
  registerCallback = (callback: CallbackFunction): number => {
    const callbackId = this.nextCallbackId++;
    this.callbacks.set(callbackId, callback);
    this.logger.info(
      `New callback function is registered with id [${callbackId}]`,
    );
    return callbackId;
  };

  /**
   * removes a callback function
   * @param id unique identifier for the callback
   */
  unregisterCallback = (id: number): void => {
    if (!this.callbacks.has(id)) {
      this.logger.debug(`No callback function is set with id [${id}]`);
      return;
    }

    this.callbacks.delete(id);
    this.logger.info(`Removed callback function with id [${id}]`);
  };

  /**
   * returns tokens config
   */
  getConfig = (): RosenTokens => {
    return structuredClone(this.tokensConfig);
  };

  /**
   * returns tokens config including unbridgeable tokens
   */
  getRawConfig = (): RosenTokens => {
    return [
      ...structuredClone(this.tokensConfig),
      ...structuredClone(this.unbridgeableTokens),
    ];
  };

  /**
   * set tokens config by json
   * @param tokens
   */
  updateConfigByJson = async (tokens: RosenTokens) => {
    await this.updateSemaphore.acquire().then(async (release) => {
      const newTokenConfig: RosenTokens = [];
      const newUnbridgeableTokens: RosenTokens = [];
      tokens.forEach((tokenSet) => {
        const chains = Object.keys(tokenSet);
        if (chains.length === 0) {
          throw new CorruptedConfigError(`Found empty token set`);
        } else if (chains.length === 1 && chains[0] !== ERGO_CHAIN) {
          // this is an unbridgeable token
          newUnbridgeableTokens.push(tokenSet);
        } else if (chains.includes(ERGO_CHAIN)) {
          newTokenConfig.push(tokenSet);
        } else {
          throw new CorruptedConfigError(
            `Found token set without chain [${ERGO_CHAIN}]`,
          );
        }
      });
      this.tokensConfig = newTokenConfig;
      this.unbridgeableTokens = newUnbridgeableTokens;
      for (const callback of this.callbacks.values()) callback();
      release();
    });
  };

  /**
   * Get a list of tokens that can be transferred between specific chains
   * @param fromChain
   * @param toChain
   */
  getTokens = (fromChain: string, toChain: string): Array<RosenChainToken> => {
    return this.tokensConfig
      .filter(
        (item) =>
          Object.hasOwn(item, fromChain) && Object.hasOwn(item, toChain),
      )
      .map((item) => item[fromChain]);
  };

  /**
   * get a list of all supported network names
   */
  getAllChains = (): Array<string> => {
    return this.tokensConfig
      .map((item) => Object.keys(item))
      .reduce(
        (allUniqChains, tokenChains) => [
          ...new Set([...allUniqChains, ...tokenChains]),
        ],
        [],
      );
  };

  /**
   * get list of all supported chains for specific chain
   * @param sourceChain
   */
  getSupportedChains = (sourceChain: string): Array<string> => {
    return this.tokensConfig
      .filter((token) => Object.hasOwn(token, sourceChain))
      .map((token) => Object.keys(token))
      .reduce(
        (allChains, newChains) => [...new Set([...allChains, ...newChains])],
        [],
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
  search = (chain: string, condition: Partial<RosenChainToken>) => {
    return this.tokensConfig.filter((token) => {
      if (Object.hasOwn(token, chain)) {
        const resToken = token[chain];
        return Object.entries(condition).every(([key, val]) => {
          const typedKey = key as keyof RosenChainToken;
          if (typedKey === 'extra' && typeof val === 'object') {
            return Object.entries(condition.extra!).every(
              ([key, val]) => resToken.extra[key] === val,
            );
          } else return resToken[typedKey] === val;
        });
      } else {
        return false;
      }
    });
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
    chain: string,
  ): string => {
    return token[chain].tokenId;
  };

  /**
   * return all native tokens for a specific chain.
   * @param chain: one of supported chains
   */
  getAllNativeTokens = (chain: string): RosenChainToken[] => {
    return this.tokensConfig
      .filter(
        (token) =>
          Object.hasOwn(token, chain) &&
          token[chain].residency == NATIVE_RESIDENCY,
      )
      .map((token) => token[chain]);
  };

  /**
   * get a token set by the id of one of them
   * @param tokenId
   * @param includeUnbridgeableTokens if true, also searches in unbridgeable tokens
   */
  getTokenSet = (
    tokenId: string,
    includeUnbridgeableTokens = false,
  ): Record<string, RosenChainToken> | undefined => {
    const tokens = includeUnbridgeableTokens
      ? [...this.tokensConfig, ...this.unbridgeableTokens]
      : this.tokensConfig;
    const result = tokens.filter(
      (tokenSet) =>
        Object.keys(tokenSet).filter(
          (chain) => tokenSet[chain].tokenId === tokenId,
        ).length,
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
    chain: string,
  ): RosenAmount => {
    const tokens = this.getTokenSet(tokenId, true);

    if (tokens === undefined) {
      // token is not supported, no decimals drop
      return {
        amount: amount,
        decimals: 0,
      };
    } else {
      const significantDecimals = Math.min(
        ...Object.keys(tokens).map(
          (supportedChain) => tokens[supportedChain].decimals,
        ),
      );
      const divisor = BigInt(
        '1' + '0'.repeat(tokens[chain].decimals - significantDecimals),
      );
      const result = amount / divisor + (amount % divisor ? 1n : 0n);
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
    toChain: string,
  ): RosenAmount => {
    const tokens = this.getTokenSet(tokenId, true);

    if (tokens === undefined) {
      // token is not supported, no decimals added
      return {
        amount: amount,
        decimals: 0,
      };
    } else {
      const significantDecimals = Math.min(
        ...Object.keys(tokens).map((chain) => tokens[chain].decimals),
      );
      const result =
        amount *
        BigInt(
          '1' + '0'.repeat(tokens[toChain].decimals - significantDecimals),
        );
      return {
        amount: result,
        decimals: tokens[toChain].decimals,
      };
    }
  };

  /**
   * returns significant decimals (decimals of the wrapped value) for a token
   * @param tokenId
   */
  getSignificantDecimals = (tokenId: string): number | undefined => {
    const tokens = this.getTokenSet(tokenId, true);
    if (tokens === undefined) {
      // token is not supported, no decimals added
      return undefined;
    }
    return Math.min(
      ...Object.keys(tokens).map((chain) => tokens[chain].decimals),
    );
  };
}
