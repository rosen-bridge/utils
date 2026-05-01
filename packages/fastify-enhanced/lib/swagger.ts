import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import {
  fastifyZodOpenApiTransform,
  fastifyZodOpenApiTransformObject,
} from 'fastify-zod-openapi';
import { ZodOpenApiVersion } from 'zod-openapi';

import { FastifyWithZod, SwaggerOpts } from './types';

/**
 * adds swagger to the fastify instance
 */
export const registerSwagger = async (
  fastify: FastifyWithZod,
  opts: SwaggerOpts,
) => {
  await fastify.register(swagger, {
    openapi: {
      openapi: '3.1.0' as ZodOpenApiVersion,
      info: {
        title: opts.title,
        description: opts.description,
        version: opts.version,
      },
      components: {
        securitySchemes: {
          apiKey: {
            type: 'apiKey',
            name: 'Api-Key',
            in: 'header',
          },
        },
      },
    },
    transform: fastifyZodOpenApiTransform,
    transformObject: fastifyZodOpenApiTransformObject,
  });

  await fastify.register(swaggerUi, {
    routePrefix: opts.path,
    uiConfig: {
      docExpansion: 'full',
      deepLinking: false,
    },
    uiHooks: {
      onRequest: (request, reply, next: () => void) => {
        next();
      },
      preHandler: (request, reply, next: () => void) => {
        next();
      },
    },
    staticCSP: opts.enableCSP,
    transformStaticCSP: (header) => header,
    transformSpecification: (swaggerObject) => swaggerObject,
    transformSpecificationClone: true,
  });
};
