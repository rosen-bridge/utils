import * as http from 'http';
import { FastifyBaseLogger, FastifyInstance } from 'fastify';
import type { FastifyZodOpenApiTypeProvider } from 'fastify-zod-openapi';

export type FastifyWithZod = FastifyInstance<
  http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>,
  http.IncomingMessage,
  http.ServerResponse<http.IncomingMessage>,
  FastifyBaseLogger,
  FastifyZodOpenApiTypeProvider
>;

export interface SwaggerOpts {
  path: string;
  title: string;
  description: string;
  version: string;
}
