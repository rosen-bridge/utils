---
'@rosen-bridge/config': minor
---

Add new schema, validation and CLI features:

- Add JSON and YAML schema files (`ConfigValidator.fromFile(fileName, format?, logger?)`), with the format taken from the extension or passed explicitly
- Add `literal`, `union` and `ref` types next to `string`, `number`, `bigint`, `boolean`, `object` and `array`
- Add rules: `required`, `enum`, `min`/`max`/`eq`, `minLength`/`maxLength`/`eqLength`, `pattern` (with `insensitive`, `multiline` and `dotall` flags), `minItems`/`maxItems`/`eqItems`, with an optional custom `message`
- Add declarative conditions for rules (`when`): `eq`, `neq`, `gt`, `gte`, `lt`, `lte`, `in`, `exists`, `not`, `all` and `any`, comparing configuration paths and static values
- Add `definitions` of reusable types and rules, used with `ref`
- Add `imports` of definitions from other schema files (`{ from, as }`), with cycle detection
- Add `validate(config, expectedHash?)`, returning the configuration with string forms converted, defaults applied and deeply frozen
- Add `buildConfig(expectedHash?)` to validate the configuration loaded by the `config` package
- Add `SCHEMA_HASH` to generated TypeScript types, checked by `validate`/`buildConfig` and by `checkTypes(fileName)` to detect stale types
- Add file-writing generators `generateTypes`, `defaults` and `environment` (with a prefix for variable names)
- Add optional logging through `@rosen-bridge/abstract-logger`
- Add CLI commands `check` (report schema problems), `check-types` (detect stale generated types) and `validate` (validate the loaded configuration, with `--config-dir`, `--env` and `--hash`)
- Add `--schema-format` and `--prefix` options to the CLI, and distinct exit codes for invalid configuration, schema problems, usage errors and I/O failures
- Make `--root-type` of `generate-ts-types` optional (defaults to the schema `id`)
- Take the output format of `generate-default`/`generate-env` from the output file extension when `--format` is not given
