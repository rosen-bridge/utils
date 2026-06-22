import { z } from 'zod';

import { FastifyWithZod } from '../lib';

/**
 * two mock routes
 * @param server
 */
export const mockRoutes = (server: FastifyWithZod) => {
  server.get(
    '/health',
    {
      schema: {
        response: {
          200: HealthResponseSchema,
          500: ErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      try {
        reply.status(200).send({
          message: 673n,
          number: 673,
        });
      } catch (error: any) {
        reply.status(500).send({ message: error.message });
      }
    },
  );

  server.post(
    '/mock',
    {
      schema: {
        body: RequestSchema,
        response: {
          200: SuccessResponseSchema,
          500: ErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      try {
        reply.status(200).send({
          array: [
            {
              num1: request.body.num1.toString(),
              num2: request.body.num2.toString(),
              num3: request.body.num3?.toString(),
            },
          ],
          sum: (
            request.body.num1 +
            request.body.num2 +
            (request.body.num3 ?? 0n)
          ).toString(),
          type: typeof request.body.num1,
        });
      } catch (error: any) {
        reply.status(500).send({ message: error.message });
      }
    },
  );

  server.get(
    '/test-error',
    {
      schema: {
        querystring: TestIncorrectResponseQuerySchema,
        response: {
          200: TestIncorrectResponseSchema,
        },
      },
    },
    async (request, reply) => {
      // invalid response body
      const id: string | undefined = undefined;
      const obj: { id: string } = { id: id! };
      reply.status(200).send(obj);
    },
  );
};

export const RequestSchema = z.object({
  num1: z.coerce.bigint(),
  num2: z.coerce.bigint(),
  num3: z.coerce.bigint(),
  num4: z.optional(z.coerce.bigint()),
});

export const ResponseObjectSchema = z.object({
  num1: z.string(),
  num2: z.string(),
  num3: z.string(),
  num4: z.optional(z.string()),
});

export const SuccessResponseSchema = z.object({
  array: z.array(ResponseObjectSchema),
  sum: z.string(),
  type: z.string(),
});

export const HealthResponseSchema = z.object({
  message: z.bigint(),
  number: z.number(),
});

export const ErrorResponseSchema = z.object({
  message: z.string(),
});

export const TestIncorrectResponseSchema = z.object({
  id: z.string(),
});

export const TestIncorrectResponseQuerySchema = z.object({
  p1: z.string(),
});
