export const apiSpec = {
  openapi: '3.1.0',
  info: { title: 'api', description: '', version: '0.0.1' },
  components: {
    securitySchemes: {
      apiKey: { type: 'apiKey', name: 'Api-Key', in: 'header' },
    },
  },
  paths: {
    '/health': {
      get: {
        responses: {
          '200': {
            description: 'Default Response',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'integer', format: 'int64' },
                    number: { type: 'number' },
                  },
                  required: ['message', 'number'],
                },
              },
            },
          },
          '500': {
            description: 'Default Response',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { message: { type: 'string' } },
                  required: ['message'],
                },
              },
            },
          },
        },
      },
    },
    '/mock': {
      post: {
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  num1: { type: 'integer', format: 'int64' },
                  num2: { type: 'integer', format: 'int64' },
                  num3: { type: 'integer', format: 'int64' },
                  num4: { type: 'integer', format: 'int64' },
                },
                required: ['num1', 'num2', 'num3'],
              },
            },
          },
          required: true,
        },
        responses: {
          '200': {
            description: 'Default Response',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    array: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          num1: { type: 'string' },
                          num2: { type: 'string' },
                          num3: { type: 'string' },
                          num4: { type: 'string' },
                        },
                        required: ['num1', 'num2', 'num3'],
                      },
                    },
                    sum: { type: 'string' },
                    type: { type: 'string' },
                  },
                  required: ['array', 'sum', 'type'],
                },
              },
            },
          },
          '500': {
            description: 'Default Response',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { message: { type: 'string' } },
                  required: ['message'],
                },
              },
            },
          },
        },
      },
    },
    '/test-filter': {
      get: {
        parameters: [
          { schema: { type: 'string' }, in: 'query', name: 'offset' },
          { schema: { type: 'string' }, in: 'query', name: 'limit' },
          { schema: { type: 'string' }, in: 'query', name: 'sorts' },
          { schema: { type: 'string' }, in: 'query', name: 'chain' },
          { schema: { type: 'string' }, in: 'query', name: 'chain!' },
          { schema: { type: 'string' }, in: 'query', name: 'tokenId*' },
          { schema: { type: 'string' }, in: 'query', name: 'tokenName*' },
        ],
        responses: {
          '200': {
            description: 'Default Response',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    fields: {
                      type: 'array',
                      items: {
                        oneOf: [
                          {
                            type: 'object',
                            properties: {
                              key: { type: 'string', enum: ['chain'] },
                              type: { type: 'string', enum: ['string'] },
                              operator: {
                                type: 'string',
                                enum: ['equal', 'notEqual'],
                              },
                              value: { type: 'string', enum: ['a', 'b', 'c'] },
                            },
                            required: ['key', 'type', 'operator', 'value'],
                          },
                          {
                            type: 'object',
                            properties: {
                              key: { type: 'string', enum: ['tokenId'] },
                              type: { type: 'string', enum: ['string'] },
                              operator: { type: 'string', enum: ['contains'] },
                              value: { type: 'string' },
                            },
                            required: ['key', 'type', 'operator', 'value'],
                          },
                          {
                            type: 'object',
                            properties: {
                              key: { type: 'string', enum: ['tokenName'] },
                              type: { type: 'string', enum: ['string'] },
                              operator: { type: 'string', enum: ['contains'] },
                              value: { type: 'string' },
                            },
                            required: ['key', 'type', 'operator', 'value'],
                          },
                        ],
                      },
                    },
                    pagination: {
                      type: 'object',
                      properties: {
                        limit: {
                          type: 'number',
                          minimum: 1,
                          maximum: 100,
                          default: 50,
                        },
                        offset: { type: 'number', minimum: 0, default: 0 },
                      },
                      required: ['limit', 'offset'],
                      default: {},
                    },
                    sorts: {
                      type: 'array',
                      items: {
                        oneOf: [
                          {
                            type: 'object',
                            properties: {
                              key: { type: 'string', enum: ['tokenName'] },
                              order: {
                                type: 'string',
                                enum: ['ASC', 'DESC'],
                                default: 'ASC',
                              },
                            },
                            required: ['key', 'order'],
                          },
                          {
                            type: 'object',
                            properties: {
                              key: { type: 'string', enum: ['chain'] },
                              order: { type: 'string', enum: ['ASC', 'DESC'] },
                            },
                            required: ['key'],
                          },
                        ],
                      },
                    },
                  },
                  required: ['pagination'],
                },
              },
            },
          },
        },
      },
    },
    '/test-error': {
      get: {
        parameters: [
          {
            schema: { type: 'string' },
            in: 'query',
            name: 'p1',
            required: true,
          },
        ],
        responses: {
          '200': {
            description: 'Default Response',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { id: { type: 'string' } },
                  required: ['id'],
                },
              },
            },
          },
        },
      },
    },
  },
};
