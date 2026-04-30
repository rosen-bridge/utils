import { FastifyInstance, FastifyHttpOptions } from 'fastify';
import type { FastifyZodOpenApiTypeProvider } from 'fastify-zod-openapi';
import * as http from 'http';

import { AbstractLogger } from '@rosen-bridge/abstract-logger';

import { FastifyLogger } from './logger';

export type FastifyWithZodServer = http.Server<
  typeof http.IncomingMessage,
  typeof http.ServerResponse
>;

export type FastifyWithZod = FastifyInstance<
  FastifyWithZodServer,
  http.IncomingMessage,
  http.ServerResponse<http.IncomingMessage>,
  FastifyLogger,
  FastifyZodOpenApiTypeProvider
>;

export type FastifyOpts = Omit<
  FastifyHttpOptions<FastifyWithZodServer, FastifyLogger>,
  'loggerInstance' | 'logger'
> & {
  logger?: AbstractLogger;
};

export type SwaggerOpts = {
  path: string;
  title: string;
  description: string;
  version: string;
};
