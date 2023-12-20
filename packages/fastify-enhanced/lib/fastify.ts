import swagger, { SwaggerOptions } from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import Fastify, { FastifyBaseLogger, FastifyInstance } from 'fastify';
import {
  ZodTypeProvider,
  jsonSchemaTransform,
  validatorCompiler,
} from 'fastify-type-provider-zod';
import type { FastifySerializerCompiler } from 'fastify/types/schema';
import * as http from 'http';
import JsonBigIntFactory from 'json-bigint';
import type { ZodAny } from 'zod';
import { FastifyWithZod, SwaggerOpts } from './types';

/**
 * creates an instance of Fastify with Zod validation library as validator and
 * type provider
 *
 * @param {string} [swaggerPath='/swagger']
 * @param {boolean} [jsonHandler=JsonBigIntFactory({
 *     alwaysParseAsBig: false,
 *     useNativeBigInt: true,
 *   })]
 * @param {*} [opts={ logger: true }]
 * @return {Promise<
 *   FastifyInstance<
 *     http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>,
 *     http.IncomingMessage,
 *     http.ServerResponse<http.IncomingMessage>,
 *     FastifyBaseLogger,
 *     ZodTypeProvider
 *   >
 * >}
 */
export const createFastify = async (
  swaggerOpts: SwaggerOpts = {
    path: '/swagger',
    title: '',
    description: '',
    version: '0.0.1',
  },
  opts = { logger: true },
  jsonHandler = JsonBigIntFactory({
    alwaysParseAsBig: false,
    useNativeBigInt: true,
  })
): Promise<FastifyWithZod> => {
  const fastify = Fastify(opts).withTypeProvider<ZodTypeProvider>();
  fastify.setValidatorCompiler(validatorCompiler);

  const serializerCompiler = getSerializerCompiler(jsonHandler);
  fastify.setSerializerCompiler(serializerCompiler);

  fastify.addContentTypeParser<string>(
    'application/json',
    { parseAs: 'string' },
    function (req, body, done) {
      try {
        const json = jsonHandler.parse(body);
        done(null, json);
      } catch (err: any) {
        err.statusCode = 400;
        done(err, undefined);
      }
    }
  );

  await addSwaggerRoute(fastify, swaggerOpts);
  return fastify;
};

/**
 * creates a Fastify serializer compiler based on Zod validation library and
 * using the passed json parser/serializer
 *
 * @param {typeof JSON} jsonHandler
 * @return {(FastifySerializerCompiler<
 *   | ZodAny
 *   | {
 *       properties: ZodAny;
 *     }
 * >)}
 */
const getSerializerCompiler = (
  jsonHandler: ReturnType<typeof JsonBigIntFactory>
): FastifySerializerCompiler<
  | ZodAny
  | {
      properties: ZodAny;
    }
> => {
  const hasOwnProperty = <T, K extends PropertyKey>(
    obj: T,
    prop: K
  ): obj is T & Record<K, any> => {
    return Object.prototype.hasOwnProperty.call(obj, prop);
  };

  /**
   * resolve the right schema to be used
   *
   * @param {(ZodAny | { properties: ZodAny })} maybeSchema
   * @return {Pick<ZodAny, 'safeParse'>}
   */
  function resolveSchema(
    maybeSchema: ZodAny | { properties: ZodAny }
  ): Pick<ZodAny, 'safeParse'> {
    if (hasOwnProperty(maybeSchema, 'safeParse')) {
      return maybeSchema;
    }
    if (hasOwnProperty(maybeSchema, 'properties')) {
      return maybeSchema.properties;
    }
    throw new Error(`Invalid schema passed: ${JSON.stringify(maybeSchema)}`);
  }

  class ResponseValidationError extends Error {
    public details: Record<string, any>;

    constructor(validationResult: Record<string, any>) {
      super("Response doesn't match the schema");
      this.name = 'ResponseValidationError';
      this.details = validationResult.error;
    }
  }

  const serializerCompiler: FastifySerializerCompiler<
    ZodAny | { properties: ZodAny }
  > =
    ({ schema: maybeSchema }) =>
    (data) => {
      const schema: Pick<ZodAny, 'safeParse'> = resolveSchema(maybeSchema);

      const result = schema.safeParse(data);
      if (result.success) {
        return jsonHandler.stringify(result.data);
      }

      throw new ResponseValidationError(result);
    };

  return serializerCompiler;
};

/**
 * adds swagger to the fastify instance
 *
 * @param {Awaited<ReturnType<typeof createFastify>>} fastify
 * @param {string} path
 */
const addSwaggerRoute = async (fastify: FastifyWithZod, opts: SwaggerOpts) => {
  fastify.register(swagger, {
    openapi: {
      info: {
        title: opts.title,
        description: opts.description,
        version: opts.version,
      },
      servers: [],
    },
    transform: jsonSchemaTransform,
  });

  fastify.register(swaggerUi, {
    routePrefix: opts.path,
    uiConfig: {
      docExpansion: 'full',
      deepLinking: false,
    },
    uiHooks: {
      onRequest: function (request: any, reply: any, next: () => void) {
        next();
      },
      preHandler: function (request: any, reply: any, next: () => void) {
        next();
      },
    },
    staticCSP: true,
    transformStaticCSP: (header: any) => header,
    transformSpecification: (swaggerObject: any, request: any, reply: any) => {
      return swaggerObject;
    },
    transformSpecificationClone: true,
  });
};
