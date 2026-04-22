import { FastifyBaseLogger, FastifyInstance } from 'fastify';
import type { FastifyZodOpenApiTypeProvider } from 'fastify-zod-openapi';
import * as http from 'http';

export type FastifyWithZodServer = http.Server<
  typeof http.IncomingMessage,
  typeof http.ServerResponse
>;

export type FastifyWithZod = FastifyInstance<
  FastifyWithZodServer,
  http.IncomingMessage,
  http.ServerResponse<http.IncomingMessage>,
  FastifyBaseLogger,
  FastifyZodOpenApiTypeProvider
>;

export type SwaggerOpts = {
  path: string;
  title: string;
  description: string;
  version: string;
};
