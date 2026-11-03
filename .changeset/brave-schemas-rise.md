---
'@rosen-bridge/config': major
---

Rewrite the package with a new schema format and a result-based API:

- Replace the old schema format and `ConfigValidator` API (`validateConfig`, `generateDefault`, `generateTSTypes`, `generateCustomEnvFile`, etc.); existing schemas must be migrated
- Return schema and configuration problems as `ParseResult` errors instead of throwing them
- Export only `ConfigValidator`, `SchemaFormats` and the `SchemaFormat`, `ParseResult` and `SchemaError` types, through an `exports` map
- Validate CLI arguments strictly, so unknown commands and options are rejected
