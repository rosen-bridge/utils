import { cloneDeep } from 'lodash-es';

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
        {
          choices: ['node', 'explorer'],
          error: 'you did not use one of the valid options',
        },
      ],
    },
  },
  config: {
    apiType: 'scanner',
  },
};

export const apiSchemaConfigPairWrongRegex = {
  schema: {
    servers: {
      type: 'object',
      children: {
        url: {
          type: 'string',
          validations: [{ regex: 'node[1-9]*.mydomain.(com|net)' }],
        },
      },
    },
  },
  config: {
    servers: {
      url: 'node2506.mydomain.com',
    },
  },
};

export const apiSchemaConfigPairWrongRequired = {
  schema: {
    servers: {
      type: 'object',
      children: {
        url: {
          type: 'string',
          validations: [
            {
              required: true,
            },
          ],
        },
      },
    },
  },
  config: {},
};

export const apiSchemaConfigPairWrongPortType = {
  schema: {
    apis: {
      type: 'object',
      children: {
        explorer: {
          type: 'object',
          children: {
            port: {
              type: 'number',
            },
          },
        },
      },
    },
  },
  config: {
    apis: {
      explorer: {
        port: 'abc',
      },
    },
  },
};

export const baseSchemaConfigPairComparison = {
  schema: {
    apis: {
      type: 'object',
      children: {
        explorer: {
          type: 'object',
          children: {
            port: {
              type: 'number',
              validations: [] as any[],
            },
          },
        },
      },
    },
  },
  config: {
    apis: {
      explorer: {
        port: 443,
      },
    },
  },
};

export const apiSchemaConfigPairWrongGreater = cloneDeep(
  baseSchemaConfigPairComparison
);
apiSchemaConfigPairWrongGreater.schema.apis.children.explorer.children.port.validations.push(
  { gt: 500 }
);
apiSchemaConfigPairWrongGreater.config.apis.explorer.port = 443;

export const apiSchemaConfigPairWrongLess = cloneDeep(
  baseSchemaConfigPairComparison
);
apiSchemaConfigPairWrongLess.schema.apis.children.explorer.children.port.validations.push(
  { lt: 500 }
);
apiSchemaConfigPairWrongLess.config.apis.explorer.port = 700;

export const apiSchemaConfigPairWrongGreaterEqual = cloneDeep(
  baseSchemaConfigPairComparison
);
apiSchemaConfigPairWrongGreaterEqual.schema.apis.children.explorer.children.port.validations.push(
  { gte: 500 }
);
apiSchemaConfigPairWrongGreaterEqual.config.apis.explorer.port = 443;

export const apiSchemaConfigPairWrongLessEqual = cloneDeep(
  baseSchemaConfigPairComparison
);
apiSchemaConfigPairWrongLessEqual.schema.apis.children.explorer.children.port.validations.push(
  { lte: 500 }
);
apiSchemaConfigPairWrongLessEqual.config.apis.explorer.port = 600;

const baseSchemaConfigPairComparisonBigInt = {
  schema: {
    apis: {
      type: 'object',
      children: {
        explorer: {
          type: 'object',
          children: {
            port: {
              type: 'bigint',
              validations: [] as any[],
            },
          },
        },
      },
    },
  },
  config: {
    apis: {
      explorer: {
        port: 443n,
      },
    },
  },
};

export const apiSchemaConfigPairWrongGreaterBigInt = cloneDeep(
  baseSchemaConfigPairComparisonBigInt
);
apiSchemaConfigPairWrongGreaterBigInt.schema.apis.children.explorer.children.port.validations.push(
  { gt: 500n }
);
apiSchemaConfigPairWrongGreaterBigInt.config.apis.explorer.port = 400n;

export const apiSchemaConfigPairWrongGreaterEqualBigInt = cloneDeep(
  baseSchemaConfigPairComparisonBigInt
);
apiSchemaConfigPairWrongGreaterEqualBigInt.schema.apis.children.explorer.children.port.validations.push(
  { gte: 500n }
);
apiSchemaConfigPairWrongGreaterEqualBigInt.config.apis.explorer.port = 400n;

export const apiSchemaConfigPairWrongLessBigInt = cloneDeep(
  baseSchemaConfigPairComparisonBigInt
);
apiSchemaConfigPairWrongLessBigInt.schema.apis.children.explorer.children.port.validations.push(
  { lt: 500n }
);
apiSchemaConfigPairWrongLessBigInt.config.apis.explorer.port = 900n;

export const apiSchemaConfigPairWrongLessEqualBigInt = cloneDeep(
  baseSchemaConfigPairComparisonBigInt
);
apiSchemaConfigPairWrongLessEqualBigInt.schema.apis.children.explorer.children.port.validations.push(
  { lte: 500n }
);
apiSchemaConfigPairWrongLessEqualBigInt.config.apis.explorer.port = 900n;

export const apiSchemaConfigPairWrongRequiredFalseWhen = {
  schema: {
    apiType: {
      type: 'string',
      validations: [
        {
          required: true,
          error: 'error message when value not validated',
          when: { path: 'apis.explorer.port', value: 8000 },
        },
      ],
    },
    apis: {
      type: 'object',
      children: {
        explorer: {
          type: 'object',
          children: {
            port: {
              type: 'number',
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
        port: 501,
      },
    },
  },
};

export const apiSchemaConfigPairWrongRegexFalseWhen = {
  schema: {
    servers: {
      type: 'object',
      children: {
        url: {
          type: 'string',
          validations: [
            {
              regex: 'node[1-9]*.mydomain.(com|net)',
              when: { path: 'apis.explorer.port', value: 8000 },
            },
          ],
        },
      },
    },
    apis: {
      type: 'object',
      children: {
        explorer: {
          type: 'object',
          children: {
            port: {
              type: 'number',
            },
          },
        },
      },
    },
  },
  config: {
    servers: {
      url: 'node2506.mydomain.org',
    },
    apis: {
      explorer: {
        port: 501,
      },
    },
  },
};

export const apiSchemaConfigPairWrongChoiceFalseWhen = {
  schema: {
    apiType: {
      type: 'string',
      validations: [
        {
          choices: ['node', 'explorer'],
          when: { path: 'apis.explorer.port', value: 5000 },
        },
      ],
    },
    apis: {
      type: 'object',
      children: {
        explorer: {
          type: 'object',
          children: {
            port: {
              type: 'number',
            },
          },
        },
      },
    },
  },
  config: {
    apiType: 'scanner',
    apis: {
      explorer: {
        port: 501,
      },
    },
  },
};

export const apiSchemaConfigPairWrongBigIntGreaterFalseWhen = {
  schema: {
    apiType: {
      type: 'string',
    },
    apis: {
      type: 'object',
      children: {
        explorer: {
          type: 'object',
          children: {
            port: {
              type: 'bigint',
              validations: [
                { gt: 500n, when: { path: 'apiType', value: 'explorer' } },
              ],
            },
          },
        },
      },
    },
  },
  config: {
    apiType: 'node',
    apis: {
      explorer: {
        port: 443n,
      },
    },
  },
};

export const apiSchemaConfigPairWrongBigIntGreaterEqualFalseWhen = {
  schema: {
    apiType: {
      type: 'string',
    },
    apis: {
      type: 'object',
      children: {
        explorer: {
          type: 'object',
          children: {
            port: {
              type: 'bigint',
              validations: [
                { gte: 500n, when: { path: 'apiType', value: 'node' } },
              ],
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
        port: 443n,
      },
    },
  },
};

export const apiSchemaConfigPairWrongBigIntLessFalseWhen = {
  schema: {
    apiType: {
      type: 'string',
    },
    apis: {
      type: 'object',
      children: {
        explorer: {
          type: 'object',
          children: {
            port: {
              type: 'bigint',
              validations: [
                { lt: 500n, when: { path: 'apiType', value: 'node' } },
              ],
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
        port: 600n,
      },
    },
  },
};

export const apiSchemaConfigPairWrongBigIntLessEqualFalseWhen = {
  schema: {
    apiType: {
      type: 'string',
    },
    apis: {
      type: 'object',
      children: {
        explorer: {
          type: 'object',
          children: {
            port: {
              type: 'bigint',
              validations: [
                { lte: 500n, when: { path: 'apiType', value: 'node' } },
              ],
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
        port: 600n,
      },
    },
  },
};

export const apiSchemaConfigPairWrongGreaterFalseWhen = {
  schema: {
    apiType: {
      type: 'string',
    },
    apis: {
      type: 'object',
      children: {
        explorer: {
          type: 'object',
          children: {
            port: {
              type: 'number',
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
    apis: {
      explorer: {
        port: 443,
      },
    },
  },
};

export const apiSchemaConfigPairWrongGreaterEqualFalseWhen = {
  schema: {
    apiType: {
      type: 'string',
    },
    apis: {
      type: 'object',
      children: {
        explorer: {
          type: 'object',
          children: {
            port: {
              type: 'number',
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
    apis: {
      explorer: {
        port: 443,
      },
    },
  },
};

export const apiSchemaConfigPairWrongLessFalseWhen = {
  schema: {
    apiType: {
      type: 'string',
    },
    apis: {
      type: 'object',
      children: {
        explorer: {
          type: 'object',
          children: {
            port: {
              type: 'number',
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
    apis: {
      explorer: {
        port: 600,
      },
    },
  },
};

export const apiSchemaConfigPairWrongLessEqualFalseWhen = {
  schema: {
    apiType: {
      type: 'string',
    },
    apis: {
      type: 'object',
      children: {
        explorer: {
          type: 'object',
          children: {
            port: {
              type: 'number',
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
    apis: {
      explorer: {
        port: 600,
      },
    },
  },
};

export const apiSchemaConfigPairWithStringBigInt = {
  schema: {
    servers: {
      type: 'object',
      children: {
        port: {
          type: 'bigint',
        },
      },
    },
  },
  config: {
    servers: {
      port: '800',
    },
  },
};

export const apiSchemaConfigPairWithStringNumber = {
  schema: {
    servers: {
      type: 'object',
      children: {
        port: {
          type: 'number',
        },
      },
    },
  },
  config: {
    servers: {
      port: '800',
    },
  },
};

export const schemaTypeScriptTypesPair = {
  schema: {
    apiType: {
      type: 'string',
    },
    explorer: {
      type: 'object',
      children: {
        domain: {
          type: 'string',
        },
        path: {
          type: 'string',
        },
      },
    },
    server: {
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
            },
            port: {
              type: 'number',
            },
          },
        },
      },
    },
  },
  types: `interface Infrastructure {
  apis: Apis;
  server: Server;
  explorer: Explorer1;
  apiType: string;
}

interface Explorer1 {
  domain: string;
  path: string;
}

interface Server {
  url: string;
  port: number;
}

interface Apis {
  explorer: Explorer;
}

interface Explorer {
  url: string;
  port: number;
}
`,
};

export const schemaConfigCharPair = {
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
  characteristic: {
    apiType: {
      label: 'api type',
      description: 'type of api to use',
      default: 'explorer',
      value: null,
      override: null,
    },
    servers: {
      url: {
        label: null,
        description: null,
        default: null,
        value: null,
        override: 'some-url.org',
      },
      port: {
        label: null,
        description: null,
        default: 500,
        value: 777,
        override: null,
      },
    },
    apis: {
      explorer: {
        url: {
          label: null,
          description: null,
          default: 'example.com',
          value: null,
          override: null,
        },
        port: {
          label: null,
          description: null,
          default: 443,
          value: null,
          override: null,
        },
      },
    },
  },
};
