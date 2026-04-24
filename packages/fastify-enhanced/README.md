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

# install compatible zod version
npm i zod@^3.21.4
```

yarn:

```sh
yarn add @rosen-bridge/fastify-enhanced

# install compatible zod version
yarn add zod@^3.21.4
```

## Usage

To use the enhanced Fastify, import `makeFastify` and use it to create a fastify instance and register routes. Install and use zod to define schemas for validating requests and responses:

> Note: For **BigInt** field types, since JSON does not support the BigInt data type, you should use `z.coerce.bigint()` in the schema, and the value in the data transfer object (DTO) should be either a **number** or a **string**; `coerce` allows Zod to validate and transform the number or string value into a BigInt. Also its preferred to use string for bigint types in the response schemas.

```ts
import { z } from 'zod';

import { FastifyWithZod, makeFastify } from '@rosen-bridge/fastify-enhanced';

const addTokenPaymentRoute = (fastify: FastifyWithZod) => {
  const bodySchema = z.object({
    tokenName: z.string(),
    tokenAmount: z.coerce.bigint(),
    tokenDecimals: z.number(),
  });

  const res200Schema = z.object({
    name: z.string(),
    amount: z.string(),
    decimal: z.number(),
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
      amount: request.body.tokenAmount.toString(),
      decimal: request.body.tokenDecimals,
    });
  });
};

const addDemoRoute = (fastify: FastifyWithZod) => {
  const bodySchema = z.object({
    numberField: z.number(),
    bigintField: z.coerce.bigint(),
    booleanField: z.boolean(),
    stringField: z.string(),
    optionalStringField: z.optional(z.string()),
    objectField: z.object({
      bigintField: z.coerce.bigint(),
      // ...
    }),
    numberArrayField: z.array(z.number()),
    stringArrayField: z.array(z.string()),
    unionField: z.union([
      z.string(),
      z.object({
        stringArrayField: z.array(z.string()),
        // ...
      }),
    ]),
  });

  const qsSchema = z.object({
    qs: z.union([z.string().transform((i) => [i]), z.array(z.string())]),
  });

  const res200Schema = z.object({
    qs: z.array(z.string()),
    numberField: z.number(),
    bigintField: z.string(),
    booleanField: z.boolean(),
    stringField: z.string(),
    optionalStringField: z.optional(z.string()),
    objectField: z.object({
      bigintField: z.string(),
      // ...
    }),
    numberArrayField: z.array(z.number()),
    stringArrayField: z.array(z.string()),
    unionField: z.union([
      z.string(),
      z.object({
        stringArrayField: z.array(z.string()),
        // ...
      }),
    ]),
  });

  const routeOpts = {
    schema: {
      querystring: qsSchema,
      body: bodySchema,
      response: {
        200: res200Schema,
      },
    },
  };

  fastify.post('/demo', routeOpts, async (request, reply) => {
    return reply.status(200).send({
      qs: request.query.qs,
      numberField: request.body.numberField,
      bigintField: request.body.bigintField.toString(),
      booleanField: request.body.booleanField,
      stringField: request.body.stringField,
      optionalStringField: request.body.optionalStringField,
      objectField: {
        bigintField: request.body.objectField.bigintField.toString(),
      },
      numberArrayField: request.body.numberArrayField,
      stringArrayField: request.body.stringArrayField,
      unionField: request.body.unionField,
    });
  });
};

const fastify = await makeFastify(
  {
    path: '/swagger',
    title: '',
    description: '',
    version: '0.0.1',
  },
  { logger: false },
);
addTokenPaymentRoute(fastify);
// Or fastify.register(addTokenPaymentRoute);
addDemoRoute(fastify);

const start = async () => {
  try {
    await fastify.ready();
    await fastify.listen({ host: '127.0.0.1', port: 8000 });
    console.log(`listening http://127.0.0.1:8000`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

start();

/*
curl --request POST \
  --url 'http://localhost:8000/demo?qs=key1&qs=key2' \
  --header 'content-type: application/json' \
  --data '{
  "numberField": 10,
  "bigintField": "10000",
  "booleanField": true,
  "stringField": "str",
  "objectField": {
    "bigintField": 10
  },
  "numberArrayField": [
    0,
    100,
    1000
  ],
  "stringArrayField": [
    "str1",
    "str2"
  ],
  "unionField": {
    "stringArrayField": [
      "str1",
      "str2"
    ]
  }
}'
*/
```

In order to use an instance of **AbstractLogger** instead of the default fastify logger, set the `logger` property of the fastify options to `false` and pass the **AbstractLogger** instance (wrapped in **FastifyLogger** class) to the `loggerInstance` property. **FastifyLogger** is an adapter for Pino interface compliance used in fastify.

```ts
import { ConsoleLogger } from '@rosen-bridge/abstract-logger';
import { makeFastify, FastifyLogger } from '@rosen-bridge/fastify-enhanced';

const fastify = await makeFastify(
  {
    path: '/swagger',
    title: '',
    description: '',
    version: '0.0.1',
  },
  {
    logger: false,
    loggerInstance: new FastifyLogger(new ConsoleLogger()),
  },
);
```
