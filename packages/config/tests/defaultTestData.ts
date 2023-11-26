export const samples = [
  {
    schema: {
      apiType: {
        type: 'enum',
        default: 'explorer',
        description: 'type of api to use',
        label: 'api type',
        choices: [{ label: '', value: '' }],
        validation: [
          { required: true, error: 'error message when value not validated' },
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
            default: {
              url: 'example.com',
              port: 8080,
            },
            validation: [
              {
                required: true,
                error: 'error message when value not validated',
                when: {
                  path: 'apiType',
                  value: 'explorer',
                },
              },
            ],
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
