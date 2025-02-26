import { Semaphore } from 'await-semaphore';
import {
  ERGO_CHAIN,
  ERGO_SIDE_TOKEN_ID_KEY,
  NATIVE_RESIDENCY,
  REQUIRED_FIELDS,
} from './constants';
import {
  CorruptedConfigError,
  ExtractedConfig,
  RosenAmount,
  RosenChainToken,
  RosenTokens,
} from './types';

/**
 * TokenMap class searches for different assets properties in different chains
 */
export class TokenMap {
  protected tokensConfig: RosenTokens;
  protected updateSemaphore: Semaphore;

  constructor() {
    this.tokensConfig = [];
    this.updateSemaphore = new Semaphore(1);
  }

  /**
   * returns tokens config
   */
  getConfig = () => {
    return structuredClone(this.tokensConfig);
  };

  /**
   * set tokens config by token map boxes
   * @param serializedBoxes list of sigma serialized bytes of token map config boxes
   */
  updateConfigByBoxes = async (serializedBoxes: string[]) => {
    if (typeof window !== 'undefined')
      throw Error(
        'The `updateConfigByBoxes` function cannot be used on browser (and similar platform where `window` variable is injected) due to usage of the `ergo-lib-wasm-nodejs` package'
      );
    const wasm = await import('ergo-lib-wasm-nodejs');
    const tokens: RosenTokens = [];
    const ergoConfigs: ExtractedConfig[] = [];
    const nonErgoConfigs: ExtractedConfig[] = [];

    serializedBoxes.forEach((serializedBox) => {
      const box = wasm.ErgoBox.sigma_parse_bytes(
        Uint8Array.from(Buffer.from(serializedBox, 'hex'))
      );
      const boxId = box.box_id().to_str();

      const chain = Buffer.from(
        box.register_value(4)?.to_byte_array() ?? []
      ).toString();
      const headers: string[] = (
        box.register_value(5)?.to_coll_coll_byte() ?? []
      ).map((header) => Buffer.from(header).toString());
      const values: string[][] = box
        .register_value(6)
        ?.to_js()
        .map((arr: Uint8Array[]) =>
          arr.map((value) => Buffer.from(value).toString())
        );

      if (!REQUIRED_FIELDS.every((field) => headers.includes(field)))
        throw new CorruptedConfigError(
          boxId,
          `Headers does not contain all required fields. Found [${headers.join(
            ','
          )}]`
        );
      if (headers[0] !== ERGO_SIDE_TOKEN_ID_KEY)
        throw new CorruptedConfigError(
          boxId,
          `Expected first header to be [${ERGO_SIDE_TOKEN_ID_KEY}] but found [${headers.join(
            ','
          )}]`
        );

      (chain === ERGO_CHAIN ? ergoConfigs : nonErgoConfigs).push({
        boxId,
        chain,
        headers,
        values,
      });
    });

    ergoConfigs.forEach((config) => {
      const boxId = config.boxId;
      const headers = config.headers;
      const values = config.values;

      values.forEach((data) => {
        if (data.length !== headers.length)
          throw new CorruptedConfigError(
            boxId,
            `Mismatch between headers and data at [${values.indexOf(
              data
            )}]: Expected length [${headers.length}] found [${data.length}]`
          );
        if (tokens.find((token) => token.ergo.tokenId === data[0]))
          throw new CorruptedConfigError(
            boxId,
            `Duplicate ergo token [${data[0]}] is found`
          );

        const chainToken: Record<string, any> = { extra: {} };
        for (let i = 1; i < headers.length; i++) {
          if (REQUIRED_FIELDS.includes(headers[i]))
            chainToken[headers[i]] = data[i];
          else chainToken.extra[headers[i]] = data[i];
        }
        chainToken.decimals = Number(chainToken.decimals);
        tokens.push({ [ERGO_CHAIN]: chainToken as RosenChainToken });
      });
    });

    nonErgoConfigs.forEach((config) => {
      const boxId = config.boxId;
      const chain = config.chain;
      const headers = config.headers;
      const values = config.values;

      values.forEach((data) => {
        if (data.length !== headers.length)
          throw new CorruptedConfigError(
            boxId,
            `Mismatch between headers and data at [${values.indexOf(
              data
            )}]: Expected length [${headers.length}] found [${data.length}]`
          );
        const index = tokens.findIndex(
          (token) => token.ergo.tokenId === data[0]
        );
        if (index === -1)
          throw new CorruptedConfigError(
            boxId,
            `Ergo token [${data[0]}] is not found`
          );

        const chainToken: Record<string, any> = { extra: {} };
        for (let i = 1; i < headers.length; i++) {
          if (REQUIRED_FIELDS.includes(headers[i]))
            chainToken[headers[i]] = data[i];
          else chainToken.extra[headers[i]] = data[i];
        }
        chainToken.decimals = Number(chainToken.decimals);

        if (Object.hasOwn(tokens[index], chain))
          throw new CorruptedConfigError(
            boxId,
            `Duplicate token for ergo token [${data[0]}] on chain [${chain}] is found: Have [${tokens[index][chain].tokenId}] found [${chainToken.tokenId}]`
          );
        tokens[index][chain] = chainToken as RosenChainToken;
      });
    });

    await this.updateConfigByJson(tokens);
  };

  /**
   * set tokens config by json
   * @param tokens
   */
  updateConfigByJson = async (tokens: RosenTokens) => {
    await this.updateSemaphore.acquire().then(async (release) => {
      this.tokensConfig = tokens;
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
        (item) => Object.hasOwn(item, fromChain) && Object.hasOwn(item, toChain)
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
        []
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
  search = (chain: string, condition: Partial<RosenChainToken>) => {
    return this.tokensConfig.filter((token) => {
      if (Object.hasOwn(token, chain)) {
        const resToken = token[chain];
        return Object.entries(condition).every(([key, val]) => {
          const typedKey = key as keyof RosenChainToken;
          if (typedKey === 'extra' && typeof val === 'object') {
            return Object.entries(condition.extra!).every(
              ([key, val]) => resToken.extra[key] === val
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
    chain: string
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
          token[chain].residency == NATIVE_RESIDENCY
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
    const result = this.tokensConfig.filter(
      (tokenSet) =>
        Object.keys(tokenSet).filter(
          (chain) => tokenSet[chain].tokenId === tokenId
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
        amount / BigInt(10 ** (tokens[chain].decimals - significantDecimals)) +
        (amount % BigInt(10 ** (tokens[chain].decimals - significantDecimals))
          ? 1n
          : 0n);
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

  /**
   * returns significant decimals (decimals of the wrapped value) for a token
   * @param tokenId
   */
  getSignificantDecimals = (tokenId: string): number | undefined => {
    const tokens = this.getTokenSet(tokenId);
    if (tokens === undefined) {
      // token is not supported, no decimals added
      return undefined;
    }
    return Math.min(
      ...Object.keys(tokens).map((chain) => tokens[chain].decimals)
    );
  };
}
