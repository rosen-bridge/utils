import * as wasm from 'ergo-lib-wasm-nodejs';
import {
  ERGO_CHAIN,
  ERGO_SIDE_TOKEN_ID_KEY,
  REQUIRED_FIELDS,
  ExtractedConfig,
  RosenChainToken,
  RosenTokens,
} from '@rosen-bridge/tokens';
import { CorruptedConfigError } from './errors';

/**
 * set tokens config by token map boxes
 * @param serializedBoxes list of sigma serialized bytes of token map config boxes
 */
export const parseTokenMapBoxes = (serializedBoxes: string[]): RosenTokens => {
  const tokens: RosenTokens = [];
  const ergoConfigs: ExtractedConfig[] = [];
  const nonErgoConfigs: ExtractedConfig[] = [];

  serializedBoxes.forEach((serializedBox) => {
    const box = wasm.ErgoBox.sigma_parse_bytes(
      Uint8Array.from(Buffer.from(serializedBox, 'hex')),
    );
    const boxId = box.box_id().to_str();

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
      throw new CorruptedConfigError(
        boxId,
        `Headers does not contain all required fields. Found [${headers.join(
          ',',
        )}]`,
      );
    if (headers[0] !== ERGO_SIDE_TOKEN_ID_KEY)
      throw new CorruptedConfigError(
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

    values.forEach((data) => {
      if (data.length !== headers.length)
        throw new CorruptedConfigError(
          boxId,
          `Mismatch between headers and data at [${values.indexOf(
            data,
          )}]: Expected length [${headers.length}] found [${data.length}]`,
        );
      if (tokens.find((token) => token.ergo.tokenId === data[0]))
        throw new CorruptedConfigError(
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

    values.forEach((data) => {
      if (data.length !== headers.length)
        throw new CorruptedConfigError(
          boxId,
          `Mismatch between headers and data at [${values.indexOf(
            data,
          )}]: Expected length [${headers.length}] found [${data.length}]`,
        );
      const index = tokens.findIndex((token) => token.ergo.tokenId === data[0]);
      if (index === -1)
        throw new CorruptedConfigError(
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
        throw new CorruptedConfigError(
          boxId,
          `Duplicate token for ergo token [${data[0]}] on chain [${chain}] is found: Have [${tokens[index][chain].tokenId}] found [${chainToken.tokenId}]`,
        );
      tokens[index][chain] = chainToken as RosenChainToken;
    });
  });

  return tokens;
};
