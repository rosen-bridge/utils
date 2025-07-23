// for manual testing

import { makeFastify } from '../lib/fastify';
import { FastifyWithZod } from '../lib/types';
import { mockRoutes } from './mockRoute';

const host = '127.0.0.1';
const port = 1338;
const mockServer: FastifyWithZod = await makeFastify();
mockServer.register(async (s: FastifyWithZod) => mockRoutes(s));
await mockServer.ready();
await mockServer.listen({ host, port });
console.log(`api service started at http://${host}:${port}`);
