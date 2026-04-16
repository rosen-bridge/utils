import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import {
  FastifyPluginAsyncZodOpenApi,
  fastifyZodOpenApiTransform,
  fastifyZodOpenApiTransformObject,
} from 'fastify-zod-openapi';
import { ZodOpenApiVersion } from 'zod-openapi';

import { SwaggerOpts } from './types';

/**
 * adds swagger to the fastify instance
 */
export const registerSwagger: FastifyPluginAsyncZodOpenApi<
  SwaggerOpts
> = async (fastify, opts) => {
  await fastify.register(swagger, {
    openapi: {
      openapi: '3.1.0' as ZodOpenApiVersion,
      info: {
        title: opts.title,
        description: opts.description,
        version: opts.version,
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
    staticCSP: true,
    transformStaticCSP: (header) => header,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    transformSpecification: (swaggerObject, request, reply) => {
      return swaggerObject;
    },
    transformSpecificationClone: true,
  });
};
