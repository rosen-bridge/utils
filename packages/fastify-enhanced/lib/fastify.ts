import Fastify from 'fastify';
import {
  type FastifyZodOpenApiTypeProvider,
  ResponseSerializationError,
  fastifyZodOpenApiPlugin,
  serializerCompiler,
  validatorCompiler,
} from 'fastify-zod-openapi';
import 'zod-openapi/extend';

import { DummyLogger } from '@rosen-bridge/abstract-logger';

import { FastifyLogger } from './logger';
import { registerSwagger } from './swagger';
import { FastifyOpts, FastifyWithZod, SwaggerOpts } from './types';

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
  opts: FastifyOpts = {},
): Promise<FastifyWithZod> => {
  const fastify = Fastify({
    ...opts,
    logger: false,
    loggerInstance: new FastifyLogger(opts.logger ?? new DummyLogger()),
  }).withTypeProvider<FastifyZodOpenApiTypeProvider>();

  fastify.setValidatorCompiler(validatorCompiler);
  fastify.setSerializerCompiler(serializerCompiler);

  await fastify.register(fastifyZodOpenApiPlugin);

  await registerSwagger(fastify, swaggerOpts);

  fastify.setErrorHandler(function (error, request, reply) {
    if (error instanceof ResponseSerializationError) {
      if (opts.logResponseSerializationErrors) this.log.error(error);
      reply.status(500).send({ message: 'Internal server error' });
    } else {
      reply.send(error);
    }
  });

  return fastify;
};
