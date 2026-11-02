# @rosen-bridge/config

Schema definition and validation for configuration loaded with the Node.js
[`config`](https://www.npmjs.com/package/config) package.

Describe the configuration once, in a JSON or YAML schema file. The package
then validates the configuration `config` loads, returns it typed, converted
and frozen, and generates the TypeScript types, the default configuration and
the `custom-environment-variables` file from the same schema.

## Table of contents

- [How it works](#how-it-works)
- [Installation](#installation)
- [Quick start](#quick-start)
- [Documentation](#documentation)

## How it works

1. **Read the schema** once with `ConfigValidator.fromFile` (or
   `fromSchema` for a schema object). Every problem in the schema is reported
   at its place in it, before any configuration is read.
2. **Validate the configuration** with `buildConfig()`, which reads the
   configuration of the `config` package, or `validate(config)` for any
   object. The result is the read configuration (string forms such as
   `"8080"` converted, defaults applied, deeply frozen) or every problem at
   its configuration path.
3. **Use the read configuration** in the application instead of
   `config.get()`, typed with the generated types.

Loading and merging the configuration files and environment variables stays
with the `config` package.

## Installation

```sh
npm i @rosen-bridge/config
```

## Quick start

1. Write a schema, `config.schema.json`:

   ```json
   {
     "id": "service",
     "schema": {
       "type": "object",
       "properties": {
         "port": {
           "type": "number",
           "default": 8080,
           "rules": [
             { "kind": "min", "bound": 1 },
             { "kind": "max", "bound": 65535 }
           ]
         },
         "network": {
           "type": "string",
           "rules": [
             { "kind": "required" },
             { "kind": "enum", "choices": ["mainnet", "testnet"] }
           ]
         },
         "apiKey": { "type": "string", "secret": true }
       }
     }
   }
   ```

2. Check it and generate the types and the configuration files:

   ```sh
   npx config check -s config.schema.json
   npx config generate-ts-types -s config.schema.json -o src/generated/config.ts
   npx config generate-default -s config.schema.json -o config/default.json
   npx config generate-env -s config.schema.json --prefix SERVICE \
     -o config/custom-environment-variables.json
   ```

3. Read the configuration in the application:

   ```ts
   import { ConfigValidator } from '@rosen-bridge/config';

   import { SCHEMA_HASH, type Service } from './generated/config';

   const validator = ConfigValidator.fromFile('config.schema.json');
   if (!validator.ok) throw new Error('the schema has problems');

   const config = validator.value.buildConfig<Service>(SCHEMA_HASH);
   if (!config.ok) {
     for (const { path, message } of config.errors)
       console.error(`${path}: ${message}`);
     process.exit(1);
   }

   config.value.port; // number, 8080 when not set
   ```

   A problem is reported at its path, with the value when it is not secret:

   ```text
   port: must be at most 65535, got 70000
   network: must be set
   ```

## Documentation

- [Schema](docs/schema.md): the schema document, types, rules, conditions,
  defaults, definitions and imports.
- [API](docs/api.md): `ConfigValidator` and the results it returns.
- [CLI](docs/cli.md): the `config` command.
