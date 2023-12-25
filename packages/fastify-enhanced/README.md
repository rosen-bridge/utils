# @rosen-bridge/fastify-enhanced

## Table of contents

- [Introduction](#introduction)
- [Installation](#installation)
- [Usage](#usage)

## Introduction

A wrapper around fastify web framework to make it even better

## Installation

npm:

```sh
npm i @rosen-bridge/fastify-enhanced
```

yarn:

```sh
yarn add @rosen-bridge/fastify-enhanced
```

## Usage

To use the enhanced Fastify, import `createFastify` and use it to create a fastify instance and register routes. Use data types defined under `types` object, to define validation constraints for requests and responses:

```ts
import {
  ZodTypeProvider,
  createFastify,
  types,
} from '@rosen-bridge/fastify-enhanced';
import { FastifyBaseLogger, FastifyInstance } from 'fastify';
import { IncomingMessage, Server, ServerResponse } from 'http';

const addTokenPaymentRoute = (
  fastify: FastifyInstance<
    Server<typeof IncomingMessage, typeof ServerResponse>,
    IncomingMessage,
    ServerResponse<IncomingMessage>,
    FastifyBaseLogger,
    ZodTypeProvider
  >
) => {
  const bodySchema = types.object({
    tokenName: types.string(),
    tokenAmount: types.bigint(),
    tokenDecimals: types.number(),
  });

  const res200Schema = types.object({
    name: types.string(),
    amount: types.bigint(),
    decimal: types.number(),
  });

  const payTokenOpts = {
    schema: {
      body: bodySchema,
      response: {
        200: res200Schema,
      },
    },
  };

  fastify.post('/payToken', payTokenOpts, async (request, reply) => {
    return reply.status(200).send({
      name: request.body.tokenName,
      amount: request.body.tokenAmount,
      decimal: request.body.tokenDecimals,
    });
  });

  return fastify;
};

const fastify = await createFastify(
  {
    path: '/swagger',
    title: '',
    description: '',
    version: '0.0.1',
  },
  { logger: false }
);
addTokenPaymentRoute(fastify);

const start = async () => {
  try {
    await fastify.listen({ port: 8000 });
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};
start();
```

To define a nested route don't forget to add `ZodTypeProvider` to the Fastify instance that is passed to the `register` method, to enable Zod typing validation:

```ts
fastify.register(
  (instance, opts, next) => {
    const subFastify = instance.withTypeProvider<ZodTypeProvider>();
    addTokenPaymentRoute(subFastify);
    next();
  },
  { prefix: 'subroute' }
);
```
