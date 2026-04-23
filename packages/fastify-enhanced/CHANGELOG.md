# @rosen-bridge/fastify-enhanced

## 3.0.0

### Major Changes

- Remove @rosen-bridge/json-bigint dependency and jsonParser in facvor of zod's coerce functionality
- Add apiKey securityScheme to swagger
- Update the type of fastify-options argument of makeFastify to FastifyHttpOptions
- Re-export fastify request and reply types

## 2.0.2

### Patch Changes

- Fix swagger types to enforce type safety and avoid any
- Replace makeSerializerCompiler function with serializerCompiler from the fastify-zod-openapi package
- Remove redundant ResponseValidationError class
- Remove redundant utils file
- Use FastifyPluginAsyncZodOpenApi for swagger plugin type

## 2.0.1

### Patch Changes

- Fix package-lock and move typescript and types/node into root
- Update dependencies
  - @rosen-bridge/json-bigint@1.1.0

## 2.0.0

### Major Changes

- Update node version to 22.18

## 1.0.0

### Major Changes

- Update fastify-enhanced package to support swagger and bigint

### Minor Changes

- Update versions of nodejs to 20.11 & typescript to 5.8

## 0.1.1

### Patch Changes

- Export fastify instance interface
