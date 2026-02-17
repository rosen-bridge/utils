import { ContentTypeParserDoneFunction } from 'fastify/types/content-type-parser';

import { JsonBigIntFactory } from '@rosen-bridge/json-bigint';

export const makeJsonParser = (
  jsonHandler: ReturnType<typeof JsonBigIntFactory>,
) => {
  return (req: unknown, body: string, done: ContentTypeParserDoneFunction) => {
    try {
      const json = jsonHandler.parse(body);
      done(null, json);
    } catch (err) {
      if (err instanceof Error || err === null) {
        done(err, undefined);
      } else {
        const wrappedErr = new Error(
          `An unexpected error occurred while trying to parse request body`,
          { cause: err },
        );
        done(wrappedErr, undefined);
      }
    }
  };
};
