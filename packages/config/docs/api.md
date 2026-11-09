# API

```ts
import {
  ConfigValidator,
  type ParseResult,
  type SchemaError,
  type SchemaFormat,
  SchemaFormats,
} from '@rosen-bridge/config';
```

Every function is synchronous. Problems in a schema or a configuration are
returned, never thrown: a function that can find them returns a
`ParseResult`.

## Results

```ts
type ParseResult<T> =
  | { ok: true; value: T }
  | { ok: false; errors: readonly SchemaError[] };

interface SchemaError {
  path: string; // `schema.properties.port.default`, or `server.port`
  message: string; // `must be at most 65535, got 70000`
}
```

`path` is a dotted pointer in the schema document for a schema problem, and
a dotted path in the configuration for a configuration problem (`''` is the
document or the configuration itself).

`SchemaFormats` is `{ Json: 'json', Yaml: 'yaml' }`; `SchemaFormat` is one
of its values.

## `ConfigValidator`

A validator of one schema. Its constructor is private: create it with
`fromFile` or `fromSchema`, once, and use it for every configuration.

### `ConfigValidator.fromFile(fileName, format?, logger?)`

Reads the schema in a JSON or YAML file.

| Parameter  | Meaning                                                                 |
| ---------- | ----------------------------------------------------------------------- |
| `fileName` | The schema file.                                                        |
| `format`   | `json` or `yaml` (default: the extension, `.json`, `.yaml` or `.yml`).  |
| `logger`   | An `AbstractLogger` of `@rosen-bridge/abstract-logger` (default: none). |

Returns `ParseResult<ConfigValidator>`. A file that cannot be read or parsed
is one problem at `''`; the problems of the schema are at their places in
it. Imports are resolved from the file's directory.

### `ConfigValidator.fromSchema(schema, logger?, file?)`

Reads a schema document that is already parsed (an object, also one written
in TypeScript). `file` is the path the schema was read from: its imports are
resolved from it, and a schema without one cannot import. Returns
`ParseResult<ConfigValidator>`.

### `validate<T>(config, expectedHash?)`

Validates a configuration object (parsed JSON, or one loaded otherwise) and
returns `ParseResult<T>`: the read configuration, with string forms
converted and defaults applied, deeply frozen, or every problem found.

With `expectedHash`, the `SCHEMA_HASH` of the generated types, the schema
must still have that hash; otherwise the types no longer describe the
configuration, and the result is the single problem `the schema changed
since its types were generated: generate them again`.

### `buildConfig<T>(expectedHash?)`

Validates the configuration of the `config` package (what the application
would read with `config.get`) with `validate`. `config` is loaded on the
first call, not when this package is imported, and then once per process:
the files in `NODE_CONFIG_DIR` for the `NODE_CONFIG_ENV` or `NODE_ENV`
deployment, `NODE_CONFIG` and `custom-environment-variables`. Throws when
the configuration cannot be loaded.

```ts
const validator = ConfigValidator.fromFile('config.schema.json');
if (!validator.ok) throw new Error('the schema has problems');
const config = validator.value.buildConfig<Service>(SCHEMA_HASH);
```

### `generateTypes(fileName, rootName?)`

Writes the TypeScript types of the read configuration to a file:

- `SCHEMA_HASH`, the hash of the schema's types, to pass to `validate` and
  `buildConfig`;
- an `interface` per object and a `type` per union, named after their last
  path segment (`Server`), or their whole path when two have the same name
  (`ConfigServer`); the root is `rootName`, by default named after the
  schema's `id` (`test-app` → `TestApp`), or `Config`;
- `readonly` members, as the read configuration is frozen; a property is
  optional unless it has an unconditional `required` rule or a default;
- `label` and `description` as doc comments; an unconditional `enum` as a
  union of its literals.

Throws when the file cannot be written.

### `checkTypes(fileName)`

Whether the `SCHEMA_HASH` in a file written by `generateTypes` is still the
hash of the schema, that is, whether the types still describe the
configuration. Use it (or `config check-types`) in CI to catch types not
generated again after a schema change. Throws when the file cannot be read
or has no `SCHEMA_HASH`.

### `defaults(fileName, format?)`

Writes the default configuration, the value an empty configuration reads
as (`{}` when the schema gives none), for example as `config/default.json`.
In JSON a `bigint` is a number with every digit; in YAML it is a string.
Throws when the format is not known or the file cannot be written.

### `environment(fileName, format?, all?, prefix?)`

Writes the `custom-environment-variables` file of the `config` package,
which maps configuration keys to the environment variables that set them.
A variable is named after its path in UPPER_SNAKE_CASE after `prefix`
(`server.tls.key` → `SERVICE_SERVER_TLS_KEY` with the prefix `SERVICE`).
Only secret values get one, or every value when `all` is `true`. Arrays get
none; the keys of every union option do. Two paths with the same name are
logged as a warning. Throws when the format is not known or the file cannot
be written.

## Logging

The `logger` given to `fromFile` or `fromSchema` receives the logs of the
validator: `trace` for each parsed element and each union option chosen,
`debug` for the steps, `info` when a schema is read or a file written, and
`warn` with the problems found. No value of a secret type is logged.
