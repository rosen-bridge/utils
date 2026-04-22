---
'@rosen-bridge/fastify-enhanced': major
---

- Remove @rosen-bridge/json-bigint dependency and jsonParser in facvor of zod's coerce functionality
- Add apiKey securityScheme to swagger
- Update the type of fastify-options argument of makeFastify to FastifyHttpOptions
- Re-export fastify request and reply types
