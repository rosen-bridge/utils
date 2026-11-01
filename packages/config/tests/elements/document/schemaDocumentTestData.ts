/**
 * A schema with a default, a secret, an enum, a bigint and a conditional
 * rule.
 */
export const serviceSchema = {
  id: 'my-service',
  schema: {
    type: 'object',
    properties: {
      port: { type: 'number', default: 8080 },
      mode: {
        type: 'string',
        rules: [{ kind: 'enum', choices: ['dev', 'prod'] }],
      },
      token: {
        type: 'string',
        secret: true,
        rules: [
          {
            kind: 'required',
            when: {
              kind: 'eq',
              left: { path: 'mode' },
              right: { value: 'prod' },
            },
          },
        ],
      },
      fee: { type: 'bigint', default: '10000000000000000000' },
    },
  },
};

/**
 * A schema that uses every kind of element: an import, conditions of every
 * kind, union options with a `when`, rules of every kind and every type.
 * It is read from `tests/fixtures`, next to `common.schema.json`.
 */
export const richSchema = {
  imports: [{ from: './common.schema.json', as: 'common' }],
  schema: {
    type: 'object',
    properties: {
      mode: { type: 'string', default: 'a' },
      port: { type: 'ref', ref: 'common.port' },
      name: {
        type: 'string',
        rules: [
          { ref: 'common.nonEmpty' },
          { kind: 'pattern', pattern: '^a', insensitive: true },
          {
            kind: 'maxLength',
            length: 3,
            when: {
              kind: 'all',
              conditions: [
                {
                  kind: 'not',
                  condition: { kind: 'exists', operand: { path: 'port' } },
                },
                {
                  kind: 'in',
                  operand: { path: 'mode' },
                  choices: [{ value: 'a' }],
                },
                { kind: 'eq', left: { path: '.mode' }, right: { value: 'a' } },
              ],
            },
          },
        ],
      },
      fee: { type: 'bigint', rules: [{ kind: 'min', bound: '1' }] },
      list: {
        type: 'array',
        items: { type: 'number', rules: [{ kind: 'enum', choices: [1, 2] }] },
        rules: [{ kind: 'minItems', count: 1 }],
      },
      store: {
        type: 'union',
        options: [
          {
            option: {
              type: 'object',
              properties: { kind: { type: 'literal', value: 'x' } },
            },
            when: {
              kind: 'any',
              conditions: [
                { kind: 'gt', left: { path: 'mode' }, right: { value: 'a' } },
              ],
            },
          },
          { option: { type: 'string' } },
        ],
      },
    },
  },
};
