export const defaulTestSamples = [
  {
    schema: {
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
];

export const correctSchemas = [
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
];

export const incorrectSchemas = [
  // schema with incorrect default value type for apis.explorer.port
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
];
