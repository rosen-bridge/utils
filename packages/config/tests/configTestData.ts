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
