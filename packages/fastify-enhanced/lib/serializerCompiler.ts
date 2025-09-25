import { FastifySerializerCompiler } from 'fastify/types/schema';
import { ZodAny } from 'zod';
import JsonBigIntFactory from 'json-bigint';

import { ResponseValidationError } from './error';
import { hasOwnProperty } from './utils';

type SerType = FastifySerializerCompiler<ZodAny | { properties: ZodAny }>;
type JsonHandler = ReturnType<typeof JsonBigIntFactory>;

/**
 * creates a Fastify serializer compiler based on Zod validation library and
 * using the passed json parser/serializer
 */
export const makeSerializerCompiler =
  (jsonHandler: JsonHandler): SerType =>
  (schemaDef) =>
  (data) => {
    const schema: Pick<ZodAny, 'safeParse'> = resolveSchema(schemaDef.schema);

    const result = schema.safeParse(data);
    if (result.success) {
      return jsonHandler.stringify(result.data);
    }

    throw new ResponseValidationError(result);
  };

/**
 * resolve the right schema to be used
 */
const resolveSchema = (
  maybeSchema: ZodAny | { properties: ZodAny },
): Pick<ZodAny, 'safeParse'> => {
  if (hasOwnProperty(maybeSchema, 'safeParse')) {
    return maybeSchema;
  }
  if (hasOwnProperty(maybeSchema, 'properties')) {
    return maybeSchema.properties;
  }
  throw new Error(`Invalid schema passed: ${JSON.stringify(maybeSchema)}`);
};
