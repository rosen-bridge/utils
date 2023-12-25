export const apiSchemaDefaultValuePairSample = {
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
};

export const correctApiSchema = {
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
};

export const schemaWithIncorrectPortDefaultValueTypeSample = {
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
};

export const apiSchemaConfigPair = {
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
          validations: [
            {
              required: true,
            },
            { regex: 'node[1-9]*.mydomain.(com|net)' },
          ],
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
              validations: [{ gt: 500 }],
            },
          },
        },
      },
    },
  },
  config: {
    apiType: 'explorer',
    servers: {
      url: 'node256.mydomain.net',
    },
    apis: {
      explorer: {
        url: 'example.com',
        port: 501,
      },
    },
  },
};

export const apiSchemaConfigPairWrongChoice = {
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
          validations: [
            {
              required: true,
            },
            { regex: 'node[1-9]*.mydomain.(com|net)' },
          ],
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
              validations: [{ gt: 500 }],
            },
          },
        },
      },
    },
  },
  config: {
    apiType: 'scanner',
    servers: {
      url: 'node256.mydomain.net',
    },
    apis: {
      explorer: {
        url: 'example.com',
        port: 501,
      },
    },
  },
};

export const apiSchemaConfigPairWrongChoiceCustomError = {
  schema: {
    apiType: {
      type: 'string',
      default: 'explorer',
      description: 'type of api to use',
      label: 'api type',
      validations: [
        {
          required: true,
        },
        {
          choices: ['node', 'explorer'],
          error: 'you did not use one of the valid options',
        },
      ],
    },
    servers: {
      type: 'object',
      children: {
        url: {
          type: 'string',
          validations: [
            {
              required: true,
            },
            { regex: 'node[1-9]*.mydomain.(com|net)' },
          ],
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
              validations: [{ gt: 500 }],
            },
          },
        },
      },
    },
  },
  config: {
    apiType: 'scanner',
    servers: {
      url: 'node256.mydomain.net',
    },
    apis: {
      explorer: {
        url: 'example.com',
        port: 501,
      },
    },
  },
};

export const apiSchemaConfigPairWrongRegex = {
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
          validations: [
            {
              required: true,
            },
            { regex: 'node[1-9]*.mydomain.(com|net)' },
          ],
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
              validations: [{ gt: 500 }],
            },
          },
        },
      },
    },
  },
  config: {
    apiType: 'explorer',
    servers: {
      url: 'node2506.mydomain.com',
    },
    apis: {
      explorer: {
        url: 'example.com',
        port: 501,
      },
    },
  },
};

export const apiSchemaConfigPairWrongRequired = {
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
          validations: [
            {
              required: true,
            },
            { regex: 'node[1-9]*.mydomain.(com|net)' },
          ],
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
              validations: [{ gt: 500 }],
            },
          },
        },
      },
    },
  },
  config: {
    apiType: 'explorer',
    apis: {
      explorer: {
        url: 'example.com',
        port: 501,
      },
    },
  },
};

export const apiSchemaConfigPairWrongPortType = {
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
          validations: [
            {
              required: true,
            },
            { regex: 'node[1-9]*.mydomain.(com|net)' },
          ],
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
              validations: [{ gt: 500 }],
            },
          },
        },
      },
    },
  },
  config: {
    apiType: 'explorer',
    servers: {
      url: 'node256.mydomain.net',
    },
    apis: {
      explorer: {
        url: 'example.com',
        port: '501',
      },
    },
  },
};

export const apiSchemaConfigPairWrongGreater = {
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
          validations: [
            {
              required: true,
            },
            { regex: 'node[1-9]*.mydomain.(com|net)' },
          ],
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
              validations: [{ gt: 500 }],
            },
          },
        },
      },
    },
  },
  config: {
    apiType: 'explorer',
    servers: {
      url: 'node256.mydomain.net',
    },
    apis: {
      explorer: {
        url: 'example.com',
        port: 443,
      },
    },
  },
};

export const apiSchemaConfigPairWrongLess = {
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
          validations: [
            {
              required: true,
            },
            { regex: 'node[1-9]*.mydomain.(com|net)' },
          ],
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
              validations: [{ lt: 500 }],
            },
          },
        },
      },
    },
  },
  config: {
    apiType: 'explorer',
    servers: {
      url: 'node256.mydomain.net',
    },
    apis: {
      explorer: {
        url: 'example.com',
        port: 700,
      },
    },
  },
};

export const apiSchemaConfigPairWrongGreaterEqual = {
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
          validations: [
            {
              required: true,
            },
            { regex: 'node[1-9]*.mydomain.(com|net)' },
          ],
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
              validations: [{ gte: 500 }],
            },
          },
        },
      },
    },
  },
  config: {
    apiType: 'explorer',
    servers: {
      url: 'node256.mydomain.net',
    },
    apis: {
      explorer: {
        url: 'example.com',
        port: 443,
      },
    },
  },
};

export const apiSchemaConfigPairWrongLessEqual = {
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
          validations: [
            {
              required: true,
            },
            { regex: 'node[1-9]*.mydomain.(com|net)' },
          ],
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
              validations: [{ lte: 500 }],
            },
          },
        },
      },
    },
  },
  config: {
    apiType: 'explorer',
    servers: {
      url: 'node256.mydomain.net',
    },
    apis: {
      explorer: {
        url: 'example.com',
        port: 700,
      },
    },
  },
};

export const apiSchemaConfigPairWrongGreaterBigInt = {
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
          validations: [
            {
              required: true,
            },
            { regex: 'node[1-9]*.mydomain.(com|net)' },
          ],
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
              type: 'bigint',
              default: 443n,
              validations: [{ gt: 500n }],
            },
          },
        },
      },
    },
  },
  config: {
    apiType: 'explorer',
    servers: {
      url: 'node256.mydomain.net',
    },
    apis: {
      explorer: {
        url: 'example.com',
        port: 400n,
      },
    },
  },
};

export const apiSchemaConfigPairWrongGreaterEqualBigInt = {
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
          validations: [
            {
              required: true,
            },
            { regex: 'node[1-9]*.mydomain.(com|net)' },
          ],
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
              type: 'bigint',
              default: 443n,
              validations: [{ gte: 500n }],
            },
          },
        },
      },
    },
  },
  config: {
    apiType: 'explorer',
    servers: {
      url: 'node256.mydomain.net',
    },
    apis: {
      explorer: {
        url: 'example.com',
        port: 400n,
      },
    },
  },
};

export const apiSchemaConfigPairWrongLessBigInt = {
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
          validations: [
            {
              required: true,
            },
            { regex: 'node[1-9]*.mydomain.(com|net)' },
          ],
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
              type: 'bigint',
              default: 443n,
              validations: [{ lt: 500n }],
            },
          },
        },
      },
    },
  },
  config: {
    apiType: 'explorer',
    servers: {
      url: 'node256.mydomain.net',
    },
    apis: {
      explorer: {
        url: 'example.com',
        port: 700n,
      },
    },
  },
};

export const apiSchemaConfigPairWrongLessEqualBigInt = {
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
          validations: [
            {
              required: true,
            },
            { regex: 'node[1-9]*.mydomain.(com|net)' },
          ],
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
              type: 'bigint',
              default: 443n,
              validations: [{ lte: 500n }],
            },
          },
        },
      },
    },
  },
  config: {
    apiType: 'explorer',
    servers: {
      url: 'node256.mydomain.net',
    },
    apis: {
      explorer: {
        url: 'example.com',
        port: 700n,
      },
    },
  },
};

export const apiSchemaConfigPairWrongRegexFalseWhen = {
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
          validations: [
            {
              required: true,
            },
            {
              regex: 'node[1-9]*.mydomain.(com|net)',
              when: { path: 'apis.explorer.port', value: 8000 },
            },
          ],
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
              validations: [{ gt: 500 }],
            },
          },
        },
      },
    },
  },
  config: {
    apiType: 'explorer',
    servers: {
      url: 'node2506.mydomain.org',
    },
    apis: {
      explorer: {
        url: 'example.com',
        port: 501,
      },
    },
  },
};

export const apiSchemaConfigPairWrongChoiceFalseWhen = {
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
        {
          choices: ['node', 'explorer'],
          when: { path: 'apis.explorer.port', value: 5000 },
        },
      ],
    },
    servers: {
      type: 'object',
      children: {
        url: {
          type: 'string',
          validations: [
            {
              required: true,
            },
            { regex: 'node[1-9]*.mydomain.(com|net)' },
          ],
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
              validations: [{ gt: 500 }],
            },
          },
        },
      },
    },
  },
  config: {
    apiType: 'scanner',
    servers: {
      url: 'node256.mydomain.net',
    },
    apis: {
      explorer: {
        url: 'example.com',
        port: 501,
      },
    },
  },
};

export const apiSchemaConfigPairWrongGreaterFalseWhen = {
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
          validations: [
            {
              required: true,
            },
            { regex: 'node[1-9]*.mydomain.(com|net)' },
          ],
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
              validations: [
                { gt: 500, when: { path: 'apiType', value: 'explorer' } },
              ],
            },
          },
        },
      },
    },
  },
  config: {
    apiType: 'node',
    servers: {
      url: 'node256.mydomain.net',
    },
    apis: {
      explorer: {
        url: 'example.com',
        port: 443,
      },
    },
  },
};

export const apiSchemaConfigPairWrongGreaterEqualFalseWhen = {
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
          validations: [
            {
              required: true,
            },
            { regex: 'node[1-9]*.mydomain.(com|net)' },
          ],
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
              validations: [
                { gte: 500, when: { path: 'apiType', value: 'node' } },
              ],
            },
          },
        },
      },
    },
  },
  config: {
    apiType: 'explorer',
    servers: {
      url: 'node256.mydomain.net',
    },
    apis: {
      explorer: {
        url: 'example.com',
        port: 443,
      },
    },
  },
};

export const apiSchemaConfigPairWrongLessFalseWhen = {
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
          validations: [
            {
              required: true,
            },
            { regex: 'node[1-9]*.mydomain.(com|net)' },
          ],
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
              validations: [
                { lt: 500, when: { path: 'apiType', value: 'node' } },
              ],
            },
          },
        },
      },
    },
  },
  config: {
    apiType: 'explorer',
    servers: {
      url: 'node256.mydomain.net',
    },
    apis: {
      explorer: {
        url: 'example.com',
        port: 600,
      },
    },
  },
};

export const apiSchemaConfigPairWrongLessEqualFalseWhen = {
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
          validations: [
            {
              required: true,
            },
            { regex: 'node[1-9]*.mydomain.(com|net)' },
          ],
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
              validations: [
                { lte: 500, when: { path: 'apiType', value: 'node' } },
              ],
            },
          },
        },
      },
    },
  },
  config: {
    apiType: 'explorer',
    servers: {
      url: 'node256.mydomain.net',
    },
    apis: {
      explorer: {
        url: 'example.com',
        port: 600,
      },
    },
  },
};
