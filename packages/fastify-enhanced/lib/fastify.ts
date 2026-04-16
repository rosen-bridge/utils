import Fastify from 'fastify';
import {
  type FastifyZodOpenApiTypeProvider,
  fastifyZodOpenApiPlugin,
  serializerCompiler,
  validatorCompiler,
} from 'fastify-zod-openapi';
import 'zod-openapi/extend';

import { JsonBigIntFactory } from '@rosen-bridge/json-bigint';

import { makeJsonParser } from './jsonParser';
import { registerSwagger } from './swagger';
import { FastifyWithZod, SwaggerOpts } from './types';

/**
 * creates an instance of Fastify with Zod validation library as validator and
 * type provider
 */
export const makeFastify = async (
  swaggerOpts: SwaggerOpts = {
    path: '/swagger',
    title: 'api',
    description: '',
    version: '0.0.1',
  },
  opts = { logger: true },
  jsonHandler = JsonBigIntFactory({
    alwaysParseAsBig: false,
    useNativeBigInt: true,
    storeAsString: true,
  }),
): Promise<FastifyWithZod> => {
  const fastify =
    Fastify(opts).withTypeProvider<FastifyZodOpenApiTypeProvider>();

  fastify.setValidatorCompiler(validatorCompiler);
  fastify.setSerializerCompiler(serializerCompiler);

  await fastify.register(fastifyZodOpenApiPlugin);

  fastify.addContentTypeParser<string>(
    'application/json',
    { parseAs: 'string' },
    makeJsonParser(jsonHandler),
  );

  await registerSwagger(fastify, swaggerOpts);

  return fastify;
};
