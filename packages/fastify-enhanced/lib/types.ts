import { FastifyBaseLogger, FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import * as http from 'http';

export type FastifyWithZod = FastifyInstance<
  http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>,
  http.IncomingMessage,
  http.ServerResponse<http.IncomingMessage>,
  FastifyBaseLogger,
  ZodTypeProvider
>;

export interface SwaggerOpts {
  path: string;
  title: string;
  description: string;
  version: string;
}
