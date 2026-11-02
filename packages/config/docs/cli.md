# CLI

```text
config check --schema|-s <schema> [--format|-f json|yaml]
config check-types --schema|-s <schema> --types|-t <file> [--format|-f json|yaml]
config generate-ts-types --schema|-s <schema> --output|-o <file> [--root-type|-r <name>] [--schema-format json|yaml]
config generate-default --schema|-s <schema> --output|-o <file> [--format|-f json|yaml] [--schema-format json|yaml]
config generate-env --schema|-s <schema> --output|-o <file> [--format|-f json|yaml] [--all|-a] [--prefix <PREFIX>] [--schema-format json|yaml]
config validate --schema|-s <schema> [--format|-f json|yaml] [--config-dir <dir>] [--env <deployment>] [--hash <SCHEMA_HASH>]
config --version
```

A schema file whose extension is not `.json`, `.yaml` or `.yml` needs its
format: `--format` in `check`, `check-types` and `validate`, and
`--schema-format` in the `generate-*` commands, whose `--format` is the
format of the file they write. `config --help` and `config <command> --help`
print the options, and `config --version` the version of the package.

| Command             | Does                                                                                                                                                                                                                 |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `check`             | Reads the schema and prints its problems, or that it is valid.                                                                                                                                                       |
| `check-types`       | Checks that the `SCHEMA_HASH` in `--types`, a file written by `generate-ts-types`, is still the hash of the schema ([`checkTypes`](api.md#checktypesfilename)), and fails when the schema changed since.             |
| `generate-ts-types` | Writes the TypeScript types and `SCHEMA_HASH` ([`generateTypes`](api.md#generatetypesfilename-rootname)).                                                                                                            |
| `generate-default`  | Writes the default configuration ([`defaults`](api.md#defaultsfilename-format)).                                                                                                                                     |
| `generate-env`      | Writes the `custom-environment-variables` file, for secret values only or every value with `--all` ([`environment`](api.md#environmentfilename-format-all-prefix)).                                                  |
| `validate`          | Validates the configuration the `config` package loads from `--config-dir` (default: `NODE_CONFIG_DIR`, else `./config`) for `--env` (default: `NODE_CONFIG_ENV` or `NODE_ENV`), after checking `--hash` when given. |

`generate-default` and `generate-env` write `--format`, or else the format of the
extension of the output file (`.json`, `.yaml`, `.yml`).

Exit codes:

| Code | Meaning                                                                 |
| ---- | ----------------------------------------------------------------------- |
| 0    | success                                                                 |
| 1    | the configuration is not valid, or the types are out of date            |
| 2    | the schema has problems                                                 |
| 3    | the command line is wrong                                               |
| 4    | a file cannot be read or written, or the configuration cannot be loaded |

Typical scripts:

```json
{
  "scripts": {
    "schema:check": "config check -s config.schema.json",
    "schema:types": "config generate-ts-types -s config.schema.json -o src/generated/config.ts",
    "schema:types:check": "config check-types -s config.schema.json -t src/generated/config.ts",
    "schema:defaults": "config generate-default -s config.schema.json -o config/default.json",
    "schema:env": "config generate-env -s config.schema.json --prefix SERVICE -o config/custom-environment-variables.json",
    "config:validate": "config validate -s config.schema.json"
  }
}
```
