import Fastify, { FastifyBaseLogger, FastifyHttpOptions } from 'fastify';
import {
  type FastifyZodOpenApiTypeProvider,
  fastifyZodOpenApiPlugin,
  serializerCompiler,
  validatorCompiler,
} from 'fastify-zod-openapi';
import 'zod-openapi/extend';

import { registerSwagger } from './swagger';
import { FastifyWithZod, FastifyWithZodServer, SwaggerOpts } from './types';

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
    enableCSP: false,
  },
  opts: FastifyHttpOptions<FastifyWithZodServer, FastifyBaseLogger> = {
    logger: true,
  },
): Promise<FastifyWithZod> => {
  const fastify =
    Fastify(opts).withTypeProvider<FastifyZodOpenApiTypeProvider>();

  fastify.setValidatorCompiler(validatorCompiler);
  fastify.setSerializerCompiler(serializerCompiler);

  await fastify.register(fastifyZodOpenApiPlugin);

  await registerSwagger(fastify, swaggerOpts);

  return fastify;
};
