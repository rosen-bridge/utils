import * as wasm from 'ergo-lib-wasm-nodejs';
import {
  ERGO_CHAIN,
  ExtractedConfig,
  RosenChainToken,
  RosenTokens,
} from '@rosen-bridge/tokens';
import { CorruptedConfigBoxError } from './errors';
import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { DummyLogger } from '@rosen-bridge/abstract-logger';
import { ERGO_SIDE_TOKEN_ID_KEY, REQUIRED_FIELDS } from './constants';

/**
 * set tokens config by token map boxes
 * @param serializedBoxes list of sigma serialized bytes of token map config boxes
 * @param logger
 */
export const parseTokenMapBoxes = (
  serializedBoxes: string[],
  logger: AbstractLogger = new DummyLogger(),
): RosenTokens => {
  const tokens: RosenTokens = [];
  const ergoConfigs: ExtractedConfig[] = [];
  const nonErgoConfigs: ExtractedConfig[] = [];

  logger.info(
    `Parsing token map config from [${serializedBoxes.length}] config boxes`,
  );
  serializedBoxes.forEach((serializedBox) => {
    const box = wasm.ErgoBox.sigma_parse_bytes(
      Uint8Array.from(Buffer.from(serializedBox, 'hex')),
    );
    const boxId = box.box_id().to_str();
    logger.debug(`Validating config box [${boxId}]`);

    const chain = Buffer.from(
      box.register_value(4)?.to_byte_array() ?? [],
    ).toString();
    const headers: string[] = (
      box.register_value(5)?.to_coll_coll_byte() ?? []
    ).map((header) => Buffer.from(header).toString());
    const values: string[][] = box
      .register_value(6)
      ?.to_js()
      .map((arr: Uint8Array[]) =>
        arr.map((value) => Buffer.from(value).toString()),
      );

    if (!REQUIRED_FIELDS.every((field) => headers.includes(field)))
      throw new CorruptedConfigBoxError(
        boxId,
        `Headers does not contain all required fields. Found [${headers.join(
          ',',
        )}]`,
      );
    if (headers[0] !== ERGO_SIDE_TOKEN_ID_KEY)
      throw new CorruptedConfigBoxError(
        boxId,
        `Expected first header to be [${ERGO_SIDE_TOKEN_ID_KEY}] but found [${headers.join(
          ',',
        )}]`,
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

    logger.debug(`Parsing config box [${boxId}] as [${ERGO_CHAIN}] config`);
    values.forEach((data) => {
      if (data.length !== headers.length)
        throw new CorruptedConfigBoxError(
          boxId,
          `Mismatch between headers and data at [${values.indexOf(
            data,
          )}]: Expected length [${headers.length}] found [${data.length}]`,
        );
      if (tokens.find((token) => token.ergo.tokenId === data[0]))
        throw new CorruptedConfigBoxError(
          boxId,
          `Duplicate ergo token [${data[0]}] is found`,
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

    logger.debug(`Parsing config box [${boxId}] as [${chain}] config`);
    values.forEach((data) => {
      if (data.length !== headers.length)
        throw new CorruptedConfigBoxError(
          boxId,
          `Mismatch between headers and data at [${values.indexOf(
            data,
          )}]: Expected length [${headers.length}] found [${data.length}]`,
        );
      if (data[0] === '') {
        // this is an unbridgeable token
        const chainToken: Record<string, any> = { extra: {} };
        for (let i = 1; i < headers.length; i++) {
          if (REQUIRED_FIELDS.includes(headers[i]))
            chainToken[headers[i]] = data[i];
          else chainToken.extra[headers[i]] = data[i];
        }
        chainToken.decimals = Number(chainToken.decimals);
        logger.debug(
          `Found unbridgeable token [${chainToken.tokenId}] on chain [${chain}]`,
        );

        tokens.push({ [chain]: chainToken as RosenChainToken });
      } else {
        // this is a bridgeable token and should be supported on Ergo
        const index = tokens.findIndex(
          (token) => token.ergo.tokenId === data[0],
        );
        if (index === -1)
          throw new CorruptedConfigBoxError(
            boxId,
            `Ergo token [${data[0]}] is not found`,
          );

        const chainToken: Record<string, any> = { extra: {} };
        for (let i = 1; i < headers.length; i++) {
          if (REQUIRED_FIELDS.includes(headers[i]))
            chainToken[headers[i]] = data[i];
          else chainToken.extra[headers[i]] = data[i];
        }
        chainToken.decimals = Number(chainToken.decimals);

        if (Object.hasOwn(tokens[index], chain))
          throw new CorruptedConfigBoxError(
            boxId,
            `Duplicate token for ergo token [${data[0]}] on chain [${chain}] is found: Have [${tokens[index][chain].tokenId}] found [${chainToken.tokenId}]`,
          );
        tokens[index][chain] = chainToken as RosenChainToken;
      }
    });
  });

  return tokens;
};
