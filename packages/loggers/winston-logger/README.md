# @rosen-bridge/winston-logger

## Table of contents

- [Introduction](#introduction)
- [Installation](#installation)
- [Configuration schema](#configuration-schema)

## Introduction

Rosen Bridge Winston logger, used inside Rosen services

## Installation

npm:

```sh
npm i @rosen-bridge/winston-logger
```

yarn:

```sh
yarn add @rosen-bridge/winston-logger
```

## Configuration schema

The package exports `schema.yaml`, a schema for
[`@rosen-bridge/config`](../../config) that describes the transports. Import
it in the schema of a service:

```yaml
imports:
  - from: '@rosen-bridge/winston-logger/schema.yaml'
    as: logger
schema:
  type: object
  properties:
    logs:
      type: ref
      ref: logger.transports
```

`logger.transports` is a list of `console`, `file` and `loki` transports
(default: one `console` transport at `info`). The single types are also
defined: `logger.transport`, `logger.consoleTransport`,
`logger.fileTransport`, `logger.lokiTransport` and `logger.level`. The read
value can be passed to `WinstonLogger.createLogger([...config.logs])`.
