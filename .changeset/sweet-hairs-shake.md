---
'@rosen-bridge/fastify-enhanced': patch
---

- Replace makeSerializerCompiler function with serializerCompiler from the fastify-zod-openapi package
- Remove redundant ResponseValidationError class
- Remove redundant utils file
- Use FastifyPluginAsyncZodOpenApi for swagger plugin type
