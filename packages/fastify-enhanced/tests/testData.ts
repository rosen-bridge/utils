export const apiSpec = {
  openapi: '3.1.0',
  info: { title: 'api', description: '', version: '0.0.1' },
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
  },
};
