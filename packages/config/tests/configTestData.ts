import { cloneDeep } from 'lodash-es';

import { ValueType } from '../lib/schema/types/fields';

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
  logs: {
    type: 'array',
    items: {
      type: 'object',
      children: {
        type: {
          type: 'string',
          validations: [
            {
              required: true,
              error: 'log type must be specified',
            },
            { choices: ['file', 'console', 'loki'] },
          ],
        },
        maxSize: {
          type: 'string',
          validations: [
            {
              required: true,
              error: 'maxSize for file log type must be specified',
              when: { path: 'logs.type', value: 'file' },
            },
          ],
        },
        maxFiles: {
          type: 'string',
          validations: [
            {
              required: true,
              error: 'maxFiles for file log type must be specified',
              when: { path: 'logs.type', value: 'file' },
            },
          ],
        },
        path: {
          type: 'string',
          validations: [
            {
              required: true,
              error: 'path for file log type must be specified',
              when: { path: 'logs.type', value: 'file' },
            },
          ],
        },
        level: {
          type: 'string',
          validations: [
            {
              required: true,
              error: 'log level must be specified',
              when: { path: 'logs.type', value: 'file' },
            },
          ],
        },
      },
    },
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
      useTls: {
        type: 'boolean',
        default: false,
        validations: [
          {
            required: true,
            error: 'useTls must be specified',
          },
        ],
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

export const arrayTypeSchemaWithoutItems = {
  logs: {
    type: 'array',
  },
};

export const objectTypeSchemaWithoutChildren = {
  api: {
    type: 'object',
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
    logs: {
      type: 'array',
      items: {
        type: 'object',
        children: {
          type: {
            type: 'string',
            validations: [
              {
                required: true,
                error: 'log type must be specified',
              },
              { choices: ['file', 'console', 'loki'] },
            ],
          },
          maxSize: {
            type: 'string',
            validations: [
              {
                required: true,
                error: 'maxSize for file log type must be specified',
                when: { path: 'logs.type', value: 'file' },
              },
            ],
          },
          maxFiles: {
            type: 'string',
            validations: [
              {
                required: true,
                error: 'maxFiles for file log type must be specified',
                when: { path: 'logs.type', value: 'file' },
              },
            ],
          },
          path: {
            type: 'string',
            validations: [
              {
                required: true,
                error: 'path for file log type must be specified',
                when: { path: 'logs.type', value: 'file' },
              },
            ],
          },
          level: {
            type: 'string',
            validations: [
              {
                required: true,
                error: 'log level must be specified',
                when: { path: 'logs.type', value: 'file' },
              },
            ],
          },
        },
      },
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
    logs: [
      {
        type: 'file',
        maxSize: '20m',
        maxFiles: '14d',
        path: './logs/',
        level: 'info',
      },
      {
        type: 'loki',
        level: 'debug',
      },
    ],
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

export const unionSchemaConfigPairWrongChoice = {
  schema: {
    value: {
      type: 'union',
      label: 'primitive union',
      children: [
        {
          type: 'number',
          validations: [{ gte: 0 }],
        },
        {
          type: 'string',
          validations: [{ choices: ['low', 'medium', 'high'] }],
        },
      ],
    },
  },
  config: {
    value: 'true',
  },
};

export const arraySchemaConfigPairWrongValueType = {
  schema: {
    logs: {
      type: 'array',
      items: {
        type: 'object',
        children: {
          type: {
            type: 'string',
          },
          maxSize: {
            type: 'string',
          },
        },
      },
    },
  },
  config: {
    logs: {
      type: 'loki',
      maxSize: '12m',
    },
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
  baseSchemaConfigPairComparison,
);
apiSchemaConfigPairWrongGreater.schema.apis.children.explorer.children.port.validations.push(
  { gt: 500 },
);
apiSchemaConfigPairWrongGreater.config.apis.explorer.port = 443;

export const apiSchemaConfigPairWrongLess = cloneDeep(
  baseSchemaConfigPairComparison,
);
apiSchemaConfigPairWrongLess.schema.apis.children.explorer.children.port.validations.push(
  { lt: 500 },
);
apiSchemaConfigPairWrongLess.config.apis.explorer.port = 700;

export const apiSchemaConfigPairWrongGreaterEqual = cloneDeep(
  baseSchemaConfigPairComparison,
);
apiSchemaConfigPairWrongGreaterEqual.schema.apis.children.explorer.children.port.validations.push(
  { gte: 500 },
);
apiSchemaConfigPairWrongGreaterEqual.config.apis.explorer.port = 443;

export const apiSchemaConfigPairWrongLessEqual = cloneDeep(
  baseSchemaConfigPairComparison,
);
apiSchemaConfigPairWrongLessEqual.schema.apis.children.explorer.children.port.validations.push(
  { lte: 500 },
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
  baseSchemaConfigPairComparisonBigInt,
);
apiSchemaConfigPairWrongGreaterBigInt.schema.apis.children.explorer.children.port.validations.push(
  { gt: 500n },
);
apiSchemaConfigPairWrongGreaterBigInt.config.apis.explorer.port = 400n;

export const apiSchemaConfigPairWrongGreaterEqualBigInt = cloneDeep(
  baseSchemaConfigPairComparisonBigInt,
);
apiSchemaConfigPairWrongGreaterEqualBigInt.schema.apis.children.explorer.children.port.validations.push(
  { gte: 500n },
);
apiSchemaConfigPairWrongGreaterEqualBigInt.config.apis.explorer.port = 400n;

export const apiSchemaConfigPairWrongLessBigInt = cloneDeep(
  baseSchemaConfigPairComparisonBigInt,
);
apiSchemaConfigPairWrongLessBigInt.schema.apis.children.explorer.children.port.validations.push(
  { lt: 500n },
);
apiSchemaConfigPairWrongLessBigInt.config.apis.explorer.port = 900n;

export const apiSchemaConfigPairWrongLessEqualBigInt = cloneDeep(
  baseSchemaConfigPairComparisonBigInt,
);
apiSchemaConfigPairWrongLessEqualBigInt.schema.apis.children.explorer.children.port.validations.push(
  { lte: 500n },
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
          default: '5372',
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
      validations: [{ choices: ['node', 'explorer', 'superApi'] }],
    },
    logs: {
      type: 'array',
      items: {
        type: 'object',
        children: {
          type: {
            type: 'string',
            validations: [
              {
                required: true,
              },
              { choices: ['file', 'console', 'loki'] },
            ],
          },
          maxSize: {
            type: 'string',
            validations: [
              {
                required: true,
                when: { path: 'logs.type', value: 'file' },
              },
            ],
          },
          maxFiles: {
            type: 'string',
            validations: [
              {
                required: true,
                when: { path: 'logs.type', value: 'file' },
              },
            ],
          },
          path: {
            type: 'string',
            validations: [
              {
                required: true,
                when: { path: 'logs.type', value: 'file' },
              },
            ],
          },
          level: {
            type: 'string',
            validations: [
              {
                required: true,
                when: { path: 'logs.type', value: 'file' },
              },
            ],
          },
        },
      },
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
  types: `export interface Infrastructure {
  apis: Apis;
  server: Server;
  explorer: Explorer;
  logs: Logs[];
  apiType?: 'node' | 'explorer' | 'superApi';
}

export interface Logs {
  type: 'file' | 'console' | 'loki';
  maxSize?: string;
  maxFiles?: string;
  path?: string;
  level?: string;
}

export interface Explorer {
  domain?: string;
  path?: string;
}

export interface Server {
  url?: string;
  port?: number;
}

export interface Apis {
  explorer: ApisExplorer;
}

export interface ApisExplorer {
  url?: string;
  port?: number;
}
`,
};

export const schemaHyphenatedKeysTypeScriptPair = {
  schema: {
    chainsConfig: {
      type: 'object',
      children: {
        'bitcoin-runes': {
          type: 'object',
          children: {
            'enabled-key': { type: 'boolean' },
          },
        },
      },
    },
  },
  types: `export interface Root {
  chainsConfig: ChainsConfig;
}

export interface ChainsConfig {
  "bitcoin-runes": ChainsConfigBitcoinRunes;
}

export interface ChainsConfigBitcoinRunes {
  "enabled-key"?: boolean;
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

// logs array schema with item-level defaults and array default elements
export const logsArraySchemaDefaultsPair = {
  schema: {
    logs: {
      type: 'array',
      items: {
        type: 'object',
        children: {
          type: {
            type: 'string',
            validations: [
              {
                required: true,
                error: 'log type must be specified',
              },
              { choices: ['file', 'console', 'loki'] },
            ],
          },
          maxSize: {
            type: 'string',
            validations: [
              {
                required: true,
                error: 'maxSize for file log type must be specified',
                when: { path: 'logs.type', value: 'file' },
              },
            ],
          },
          maxFiles: {
            type: 'string',
            validations: [
              {
                required: true,
                error: 'maxFiles for file log type must be specified',
                when: { path: 'logs.type', value: 'file' },
              },
            ],
          },
          path: {
            type: 'string',
            default: '/var/log/app.log',
            validations: [
              {
                required: true,
                error: 'path for file log type must be specified',
                when: { path: 'logs.type', value: 'file' },
              },
            ],
          },
          level: {
            type: 'string',
            default: 'info',
            validations: [
              {
                required: true,
                error: 'log level must be specified',
                when: { path: 'logs.type', value: 'file' },
              },
            ],
          },
        },
      },
      default: [{ type: 'file', level: 'debug' }, { type: 'console' }],
    },
  },
  defaultVal: {
    logs: [
      { type: 'file', level: 'debug', path: '/var/log/app.log' },
      { type: 'console', level: 'info', path: '/var/log/app.log' },
    ],
  },
};

// empty array defaults for primitive types
export const emptyArrayDefaultsPair = {
  schema: {
    emptyStringArray: {
      type: 'array' as const,
      default: [],
      items: { type: 'string' as const },
    },
    emptyNumberArray: {
      type: 'array' as const,
      default: [],
      items: { type: 'number' as const },
    },
  },
  defaultVal: {
    emptyStringArray: [],
    emptyNumberArray: [],
  },
};

// schema including an array without default to be excluded from defaults result
export const arrayWithoutDefaultPair = {
  schema: {
    withDefault: {
      type: 'string' as const,
      default: 'test',
    },
    arrayWithoutDefault: {
      type: 'array' as const,
      items: { type: 'string' as const },
    },
  },
  defaultVal: {
    withDefault: 'test',
  },
};

// logs array with invalid defaults (choices violation, missing required) plus expected generated defaults
export const invalidLogsArrayDefaultsPair = {
  schema: {
    logs: {
      type: 'array',
      items: {
        type: 'object',
        children: {
          type: {
            type: 'string',
            validations: [
              { required: true, error: 'log type must be specified' },
              { choices: ['file', 'console', 'loki'] },
            ],
          },
          path: { type: 'string', default: '/var/log/app.log' },
          level: { type: 'string', default: 'info' },
        },
      },
      default: [{ type: 'unknown' }, { level: 'debug' }] as ValueType[],
    },
  },
  defaultVal: {
    logs: [
      { type: 'unknown', path: '/var/log/app.log', level: 'info' },
      { level: 'debug', path: '/var/log/app.log' },
    ],
  },
};

// logs array with unknown key inside defaults, plus expected generated defaults
export const unknownKeyLogsArrayDefaultsPair = {
  schema: {
    logs: {
      type: 'array',
      items: {
        type: 'object',
        children: {
          path: { type: 'string', default: '/var/log/app.log' },
          level: { type: 'string', default: 'info' },
        },
      },
      default: [{ pathsskddkfjd: '/tmp/weird' }],
    },
  },
  defaultVal: {
    logs: [
      { path: '/var/log/app.log', level: 'info', pathsskddkfjd: '/tmp/weird' },
    ],
  },
};

// Schemas for duplicate key/type generation tests
export const duplicateChildKeysSchema = {
  schema: {
    user: {
      type: 'object',
      children: {
        database: {
          type: 'object',
          children: {
            host: { type: 'string' },
            port: { type: 'number' },
          },
        },
      },
    },
    apis: {
      type: 'object',
      children: {
        explorer: {
          type: 'object',
          children: {
            url: { type: 'string' },
            port: { type: 'number' },
          },
        },
      },
    },
  },
};

export const identicalStructurePathsSchema = {
  schema: {
    primary: {
      type: 'object',
      children: {
        connection: {
          type: 'object',
          children: {
            host: { type: 'string' },
            port: { type: 'number' },
            ssl: { type: 'boolean' },
          },
        },
      },
    },
    backup: {
      type: 'object',
      children: {
        connection: {
          type: 'object',
          children: {
            host: { type: 'string' },
            port: { type: 'number' },
            ssl: { type: 'boolean' },
          },
        },
      },
    },
  },
};

export const arrayItemsAtRootSchema = {
  schema: {
    logs: {
      type: 'array',
      items: {
        type: 'object',
        children: {
          message: { type: 'string' },
          level: { type: 'string' },
        },
      },
    },
  },
};

// Nested defaults: array of objects where an item key is itself a nested array
export const nestedArrayInArrayDefaultsPair = {
  schema: {
    logs: {
      type: 'array',
      items: {
        type: 'object',
        children: {
          name: { type: 'string', default: 'file' },
          tags: {
            type: 'array',
            items: { type: 'string' },
            default: ['t1', 't2'],
          },
          labels: {
            type: 'array',
            items: { type: 'string' },
            default: ['L1'],
          },
        },
      },
      default: [{}, { tags: ['custom'], labels: [] }],
    },
  },
  defaultVal: {
    logs: [
      { name: 'file', tags: ['t1', 't2'], labels: ['L1'] },
      { name: 'file', tags: ['custom'], labels: [] },
    ],
  },
};

export const unionDefaultsPair = {
  schema: {
    config: {
      type: 'union',
      children: [
        {
          type: 'object',
          children: {
            type: {
              type: 'string',
              validations: [{ choices: ['A'] }],
              default: 'A',
            },
            a: { type: 'number', default: 30 },
          },
        },
        {
          type: 'object',
          children: {
            model: {
              type: 'string',
              validations: [{ choices: ['B'] }],
            },
            b: { type: 'string' },
          },
        },
      ],
    },
  },
  defaultVal: {
    config: {
      type: 'A',
      a: 30,
    },
  },
};

export const unionDefaultsPrimitiveField = {
  schema: {
    config: {
      type: 'union',
      children: [
        {
          type: 'string',
          validations: [{ choices: ['A'] }],
          default: 'A',
        },
        {
          type: 'number',
        },
      ],
    },
  },
  defaultVal: {
    config: 'A',
  },
};

// Schema for invalid defaults used with generateDefault({ validate: true })
export const invalidDefaultsValidateOptionSchema = {
  schema: {
    logs: {
      type: 'array',
      items: {
        type: 'object',
        children: {
          type: {
            type: 'string',
            validations: [
              { required: true },
              { choices: ['file', 'console', 'loki'] },
            ],
          },
          level: { type: 'string', default: 'info' },
        },
      },
      default: [{ type: 'unknown' }, { level: 'debug' }] as ValueType[],
    },
  },
};

// Schema for required field without default
export const requiredWithoutDefaultSchema = {
  schema: {
    service: {
      type: 'object',
      children: {
        apiKey: {
          type: 'string',
          validations: [{ required: true }],
        },
      },
    },
  },
};

// Default-shape validation fixtures
export const arrayPrimitiveDefaultsValid = {
  schema: {
    ports: {
      type: 'array',
      items: { type: 'number' },
      default: [80, 443],
    },
  },
};

export const arrayPrimitiveDefaultsInvalid = {
  schema: {
    ports: {
      type: 'array',
      items: { type: 'number' },
      // invalid: contains a string
      default: [80, '443'],
    },
  },
};

export const arrayObjectDefaultsInvalidChildType = {
  schema: {
    services: {
      type: 'array',
      items: {
        type: 'object',
        children: {
          enabled: { type: 'boolean' },
          path: { type: 'string' },
        },
      },
      // invalid: enabled should be boolean
      default: [{ enabled: 'true', path: '/var' }],
    },
  },
};

export const nestedArrayDefaultsInvalid = {
  schema: {
    logs: {
      type: 'array',
      items: {
        type: 'object',
        children: {
          name: { type: 'string' },
          tags: { type: 'array', items: { type: 'string' } },
        },
      },
      // invalid: tags contains a number
      default: [{ name: 'file', tags: ['ok', 1] }],
    },
  },
};

export const nestedArrayDefaultsValid = {
  schema: {
    logs: {
      type: 'array',
      items: {
        type: 'object',
        children: {
          name: { type: 'string' },
          tags: { type: 'array', items: { type: 'string' } },
        },
      },
      default: [{ name: 'file', tags: ['ok', 'x'] }],
    },
  },
};

// Nested array of objects inside array of objects (valid)
export const nestedArrayOfObjectsDefaultsValid = {
  schema: {
    services: {
      type: 'array',
      items: {
        type: 'object',
        children: {
          name: { type: 'string' },
          handlers: {
            type: 'array',
            items: {
              type: 'object',
              children: {
                type: { type: 'string' },
                retries: { type: 'number' },
              },
            },
            default: [{ type: 'file', retries: 3 }],
          },
        },
      },
      default: [
        { name: 'api' },
        { name: 'worker', handlers: [{ type: 'console', retries: 1 }] },
      ],
    },
  },
  defaultVal: {
    services: [
      { name: 'api', handlers: [{ type: 'file', retries: 3 }] },
      { name: 'worker', handlers: [{ type: 'console', retries: 1 }] },
    ],
  },
};

// Nested array of objects inside array of objects (invalid inner element shape)
export const nestedArrayOfObjectsDefaultsInvalid = {
  schema: {
    services: {
      type: 'array',
      items: {
        type: 'object',
        children: {
          name: { type: 'string' },
          handlers: {
            type: 'array',
            items: {
              type: 'object',
              children: {
                type: { type: 'string' },
                retries: { type: 'number' },
              },
            },
            // invalid: retries should be number, unknown key also invalid
            default: [{ type: 'file', retries: 'three', extra: true }],
          },
        },
      },
      default: [{ name: 'api' }],
    },
  },
};

// Wrong choice default at primitive level
export const wrongChoiceDefaultSchema = {
  schema: {
    mode: {
      type: 'string',
      default: 'good',
      validations: [{ choices: ['hello', 'bye'] }],
    },
  },
};

// Wrong choice default nested in array of objects
export const nestedWrongChoiceDefaultSchema = {
  schema: {
    logs: {
      type: 'array',
      items: {
        type: 'object',
        children: {
          type: {
            type: 'string',
            default: 'unknown',
            validations: [{ choices: ['file', 'console', 'loki'] }],
          },
          level: { type: 'string', default: 'info' },
        },
      },
      default: [{}],
    },
  },
};

export const arraySchemaDefaultValuePairSample = {
  schema: {
    stringArray: {
      type: 'array',
      default: ['item1', 'item2', 'item3'],
      description: 'array of strings',
      items: {
        type: 'string',
      },
    },
    numberArray: {
      type: 'array',
      default: [1, 2, 3, 42],
      description: 'array of numbers',
      items: {
        type: 'number',
      },
    },
    emptyArray: {
      type: 'array',
      default: [],
      description: 'empty array',
      items: {
        type: 'string',
      },
    },
    noDefaultArray: {
      type: 'array',
      description: 'array without default',
      items: {
        type: 'boolean',
      },
    },
  },
  defaultVal: {
    stringArray: ['item1', 'item2', 'item3'],
    numberArray: [1, 2, 3, 42],
    emptyArray: [],
  },
};
