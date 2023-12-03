export const defaulTestSamples: Array<
  [string, { schema: any; defaultVal: any }]
> = [
  [
    'has default value for apiType and apis',
    {
      schema: {
        apiType: {
          type: 'string',
          default: 'explorer',
          description: 'type of api to use',
          label: 'api type',
          validations: [
            {
              required: true,
              error: 'error message when value not validated',
            },
            { choices: ['node', 'explorer'] },
          ],
        },
        servers: {
          type: 'object',
          children: {
            url: {
              type: 'string',
            },
            port: {
              type: 'number',
            },
          },
        },
        apis: {
          type: 'object',
          children: {
            explorer: {
              type: 'object',
              children: {
                url: {
                  type: 'string',
                  default: 'example.com',
                },
                port: {
                  type: 'number',
                  default: 443,
                },
              },
            },
          },
        },
      },
      defaultVal: {
        apiType: 'explorer',
        apis: {
          explorer: {
            url: 'example.com',
            port: 443,
          },
        },
      },
    },
  ],
];

export const correctSchemas: Array<[string, any]> = [
  [
    'schema for a hypothetical api server',
    {
      apiType: {
        type: 'string',
        default: 'explorer',
        description: 'type of api to use',
        label: 'api type',
        validations: [
          { required: true, error: 'error message when value not validated' },
          { choices: ['node', 'explorer'] },
        ],
      },
      servers: {
        type: 'object',
        children: {
          url: {
            type: 'string',
          },
          port: {
            type: 'number',
          },
        },
      },
      apis: {
        type: 'object',
        children: {
          explorer: {
            type: 'object',
            children: {
              url: {
                type: 'string',
                default: 'example.com',
              },
              port: {
                type: 'number',
                default: 443,
              },
            },
          },
        },
      },
    },
  ],
];

export const incorrectSchemas: Array<[string, any]> = [
  [
    'incorrect default value type for apis.explorer.port',
    {
      apiType: {
        type: 'string',
        default: 'explorer',
        description: 'type of api to use',
        label: 'api type',
        validations: [
          { required: true, error: 'error message when value not validated' },
          { choices: ['node', 'explorer'] },
        ],
      },
      servers: {
        type: 'object',
        children: {
          url: {
            type: 'string',
          },
          port: {
            type: 'number',
          },
        },
      },
      apis: {
        type: 'object',
        children: {
          explorer: {
            type: 'object',
            children: {
              url: {
                type: 'string',
                default: 'example.com',
              },
              port: {
                type: 'number',
                default: '443',
              },
            },
          },
        },
      },
    },
  ],
];
