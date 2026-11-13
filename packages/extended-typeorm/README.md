# @rosen-bridge/extended-typeorm

## Table of contents

- [Introduction](#introduction)
- [Installation](#installation)
- [Usage](#usage)
- [Configuration schema](#configuration-schema)

## Introduction

By default, typeorm doesn't handle parallel transactions. If you run two
transactions simultaneously and your database doesn't support it (e.g. if you
use sqlite), you will get errors.

## Installation

npm:

```sh
npm i @rosen-bridge/extended-typeorm
```

yarn:

```sh
yarn add @rosen-bridge/extended-typeorm
```

## Usage

```ts
import { DataSource } from '@rosen-bridge/extended-typeorm';

const dataSource = DataSource({
  ...
})
```

Now all database transaction execute correctly without throwing an error, no matter if you call them simultaneously or not.

## Configuration schema

The package exports `schema.yaml`, a schema for
[`@rosen-bridge/config`](../config) that describes the database
connection. Import it in the schema of a service:

```yaml
imports:
  - from: '@rosen-bridge/extended-typeorm/schema.yaml'
    as: db
schema:
  type: object
  properties:
    database:
      type: ref
      ref: db.database
```

`db.database` is one of:

- `{ type: sqlite, database }`: `database` is the path of the file;
- `{ type: postgres, host, port, username, password, database, schema?, ssl }`:
  `host` defaults to `localhost`, `port` to `5432` and `ssl` to `false`;
  `password` is secret.

`db.sqlite` and `db.postgres` are also defined, for a service that supports
only one of them. The keys follow the TypeORM `DataSourceOptions`:

```ts
const dataSource = new DataSource({
  ...config.database,
  entities,
  migrations,
});
```
