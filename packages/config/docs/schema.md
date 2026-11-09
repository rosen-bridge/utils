# Schema

A schema is a JSON or YAML document. JSON integers beyond the safe integer
range are read as `bigint`s, so they keep every digit; YAML is read with the
core schema (JSON values only).

Every node of a schema is checked: an unknown key, a missing required key or
a value of the wrong kind is a problem reported at its dotted pointer in the
document (`schema.properties.port.default`). All problems are reported at
once.

## Table of contents

- [Schema document](#schema-document)
- [Types](#types)
- [Defaults](#defaults)
- [Rules](#rules)
- [Conditions](#conditions)
- [Definitions](#definitions)
- [Imports](#imports)
- [Reading a configuration](#reading-a-configuration)

## Schema document

```json
{
  "$schema": "…",
  "id": "test-app",
  "imports": [{ "from": "./common.json", "as": "common" }],
  "definitions": { "types": {}, "rules": {} },
  "schema": { "type": "object", "properties": {} }
}
```

| Key           | Required | Meaning                                                                                   |
| ------------- | -------- | ----------------------------------------------------------------------------------------- |
| `$schema`     | no       | A string for editors; otherwise ignored.                                                  |
| `id`          | no       | The name of the schema: a letter, then letters, digits, `-` and `_`. Names the root type. |
| `imports`     | no       | Other schema files whose definitions this one uses ([Imports](#imports)).                 |
| `definitions` | no       | Types and rules defined by name ([Definitions](#definitions)).                            |
| `schema`      | yes      | The root type, usually an `object`. A document without it can only be imported.           |

## Types

Every type node has a `type` and may have:

| Key           | Meaning                                                                                |
| ------------- | -------------------------------------------------------------------------------------- |
| `label`       | A short name, a string. Written to the generated types.                                |
| `description` | A string. Written to the generated types.                                              |
| `secret`      | `true` hides the value, and every value below it, from messages and logs.              |
| `rules`       | A list of [rules](#rules) the value must pass.                                         |
| `default`     | The value used when the configuration has none ([Defaults](#defaults)); not `literal`. |

### Scalars

| `type`    | Accepts                                                             | Read as |
| --------- | ------------------------------------------------------------------- | ------- |
| `string`  | a string                                                            | string  |
| `number`  | a finite number, or a number string (`"8080"`, `"-2.5"`, `"1e3"`)   | number  |
| `bigint`  | a `bigint`, a safe integer, or an integer string (`"100000000000"`) | bigint  |
| `boolean` | `true`, `false`, `"true"` or `"false"`                              | boolean |

The string forms are accepted because environment variables are strings.
A `number` beyond ±9007199254740991 is out of bounds. A `bigint` written as
a number beyond that range may have lost digits, so it is rejected: write it
as a string.

### `literal`

Exactly one value: a string, a number, a bigint or a boolean.

```json
{ "type": "literal", "value": "postgres" }
```

A value is read with the scalar type of `value` (`"8080"` matches `8080`)
and must equal it. A literal is always required and has no `default`; its
generated type is the value (`'postgres'`). Literals tell the options of a
union apart.

### `object`

```json
{
  "type": "object",
  "properties": {
    "host": { "type": "string" },
    "port": { "type": "number", "default": 8080 }
  }
}
```

`properties` maps each name to its type. A name cannot contain `.` (the
path separator) or be `__proto__`, `constructor` or `prototype`. A key of
the configuration that is not a property is a problem (`key is not in the
schema`). Properties are optional unless they have a `required` rule or a
default.

### `array`

```json
{
  "type": "array",
  "items": { "type": "number" },
  "rules": [{ "kind": "maxItems", "count": 3 }]
}
```

Every item is read with `items`; problems are reported at the item's index
(`color.1`).

### `union`

A value of one of several types:

```json
{
  "type": "union",
  "options": [
    { "option": { "type": "ref", "ref": "postgres" } },
    {
      "option": { "type": "ref", "ref": "sqlite" },
      "when": {
        "kind": "eq",
        "left": { "path": "environment" },
        "right": { "value": "development" }
      }
    }
  ]
}
```

`options` lists at least two options, each `{ option, when? }`: the type of
the option and an optional [condition](#conditions) under which it applies.
A value is read with the first option that applies and reads it without
problems; `must match one of the options` otherwise, and `no option applies`
when every `when` is false. Rules with a `when` inside an option are
checked once the whole configuration is read, so they never decide the
option.

### `ref`

A use of a type defined under `definitions.types`:

```json
{
  "type": "ref",
  "ref": "common.port",
  "rules": [{ "kind": "min", "bound": 1024 }]
}
```

Each use gets its own copy of the type, at its own place in the
configuration. The rules of the `ref` are checked after the defined type's
own, so a use can narrow a definition but not relax it. A `default` on the
`ref` replaces the defined type's.

## Defaults

A `default` is the value a type has when the configuration has none. It is
read when the schema is parsed, like a configuration value: converted
(`"2.5"` to `2.5`), and checked against the type's rules without a `when`,
those of the types below it included. A default that fails is a problem at
`…default`.

- Scalars and arrays: the value.
- Objects: an object whose missing properties get their own defaults:

  ```json
  {
    "type": "object",
    "properties": {
      "host": { "type": "string" },
      "port": { "type": "number", "default": 5432 }
    },
    "default": { "host": "localhost" }
  }
  ```

  reads as `{ "host": "localhost", "port": 5432 }` when the configuration
  has no value. An object without a `default` gets an object of its
  properties' defaults when one of them has a value.

- Unions: a value of one of the options, read again when it is used, by the
  options that apply then.
- `ref`: replaces the default of the defined type.

A type with a default is always set in the read configuration, so its
generated property is not optional.

## Rules

A rule is written `{ kind, …, message?, when? }`. Every rule of a type must
pass. A value that is not set passes every rule but `required`.

| `kind`      | Parameter         | Applies to                      | The value…                       |
| ----------- | ----------------- | ------------------------------- | -------------------------------- |
| `required`  | –                 | every type                      | is set                           |
| `enum`      | `choices`: a list | string, number, bigint, boolean | is one of `choices`              |
| `min`       | `bound`           | number, bigint                  | is at least `bound`              |
| `max`       | `bound`           | number, bigint                  | is at most `bound`               |
| `eq`        | `bound`           | number, bigint                  | equals `bound`                   |
| `minLength` | `length`          | string                          | has at least `length` characters |
| `maxLength` | `length`          | string                          | has at most `length` characters  |
| `eqLength`  | `length`          | string                          | has exactly `length` characters  |
| `pattern`   | `pattern`, flags  | string                          | matches `pattern`                |
| `minItems`  | `count`           | array                           | has at least `count` items       |
| `maxItems`  | `count`           | array                           | has at most `count` items        |
| `eqItems`   | `count`           | array                           | has exactly `count` items        |

- `bound` and the `choices` of `enum` are written like values of the type
  (`"100000000000000000000"` for a large `bigint`). `choices` must be
  distinct.
- Lengths count Unicode code points; `length` and `count` are non-negative
  integers.
- `pattern` is a JavaScript regular expression in Unicode mode, **not
  anchored** (write `^…$`). The flags `insensitive` (`i`), `multiline` (`m`)
  and `dotall` (`s`) are boolean keys of the rule.
- `message` (a non-empty string of at most 500 characters) replaces the
  message of the rule: `{ "kind": "min", "bound": 1, "message": "must be a
valid port" }`.
- `when` makes the rule apply only when a [condition](#conditions) holds:
  `{ "kind": "required", "when": … }`. Rules with a `when` are checked once
  the whole configuration is read.
- An unconditional `enum` narrows the generated type to its choices
  (`'debug' | 'info'`); an unconditional `required` makes the property
  required.
- `{ "ref": "name", "when"? }` uses a [defined rule](#defined-rules).

## Conditions

A condition is data, never code. It is written `{ kind, … }`:

| `kind`                   | Keys                         | Holds when                                         |
| ------------------------ | ---------------------------- | -------------------------------------------------- |
| `eq`                     | `left`, `right`              | both sides are set and equal                       |
| `neq`                    | `left`, `right`              | not `eq`: a side is not set, or they differ        |
| `gt`, `gte`, `lt`, `lte` | `left`, `right`              | both sides are set and ordered (`left > right`, …) |
| `in`                     | `operand`, `choices`: a list | the operand is set and equals one of the choices   |
| `exists`                 | `operand`: a path            | the value at the path is set                       |
| `not`                    | `condition`                  | the condition does not hold                        |
| `all`                    | `conditions`: a list         | every condition holds                              |
| `any`                    | `conditions`: a list         | at least one condition holds                       |

The sides and operands are evaluators:

- `{ "path": "server.port" }`, the value at a path of the configuration;
- `{ "value": 8080 }`, a static value, written like a value of the type it is
  compared with (`"8080"` is fine for a number).

At least one evaluator of a comparison is a path, and every path compared
leads to a scalar of one kind (a `literal` counts as its value's kind).
Ordering works on numbers, bigints and strings, not booleans.

### Paths

A path is dot-separated names and array indexes:

- **absolute**: from the configuration root, `server.port`, `nodes.0.url`;
- **relative**: starting with dots, from the node whose rule has the
  condition. One dot is its parent and each further dot one more level up
  (an array index is a level): for a rule on `server.tls.cert`, `.enabled` is
  `server.tls.enabled` and `..port` is `server.port`.

Every path is checked when the schema is read: a path that cannot be in the
configuration is a problem. A path that goes through a union reaches the
options that have its next name.

A condition reads the configuration as it will be read: values converted
(`"8080"` to `8080`), and a value the configuration lacks taken from the
defaults.

## Definitions

```json
{
  "definitions": {
    "types": {
      "port": { "type": "number", "rules": [{ "kind": "max", "bound": 65535 }] }
    },
    "rules": {
      "nonEmpty": {
        "type": ["string"],
        "description": "A string with at least one character",
        "rules": [{ "kind": "minLength", "length": 1 }]
      }
    }
  }
}
```

Definitions are parsed even when they are not used, in any order. A name
cannot contain `.` or be `__proto__`, `constructor` or `prototype`, and a
definition that refers to itself, directly or through others, is a problem.

### Defined types

Any type, used with `{ "type": "ref", "ref": "port" }`. Relative paths in
its conditions start from each use's place in the configuration.

### Defined rules

`{ type, description?, rules }`:

- `type` lists the kinds of type the rule can be used on
  (`["number", "bigint"]`); the rule is checked for each of them.
- `description` documents the rule.
- `rules` is a non-empty list of rules, or `{ ref }`s to other defined rules
  that list the kind too. They cannot have a `when`.

It is used as `{ "ref": "nonEmpty", "when"? }` in the `rules` of a type of a
listed kind. The `when` goes on the use, not on the definition.

## Imports

```json
{
  "imports": [
    { "from": "./schemas/common.json", "as": "common" },
    { "from": "@rosen-bridge/chain-config/ergo.schema.yaml", "as": "ergo" }
  ]
}
```

- `from` is a path relative to the importing file (`./`, `../`), or a file
  of an installed package (resolved like Node.js, following the package's
  `exports`). URLs and absolute paths are not allowed. A schema read from an
  object, not a file, cannot import.
- `as` names the import: a letter, then letters, digits, `-` and `_`. The
  definitions of the imported file are used as `<as>.<name>`
  (`common.port`), and those of its imports as `<as>.<as>.<name>`.
- Only the `imports` and `definitions` of an imported file are read; its
  `schema` is not. Each file is read once, and files that import each other
  are a problem. Problems in an imported file are reported at
  `[<file>].<pointer>`.

## Reading a configuration

- Values are converted to their types (`"8080"` to `8080`, `"true"` to
  `true`, `"10"` to `10n`), and defaults are applied.
- Every problem is reported at its dotted path in the configuration
  (`server.port`, `nodes.1.url`, `''` for the root): a value of the wrong
  type, a key that is not in the schema, a failed rule.
- A message ends with the value when it is a scalar and not secret
  (`must be at most 65535, got 70000`); a secret value is never shown.
- The read configuration is a new object, deeply frozen.
