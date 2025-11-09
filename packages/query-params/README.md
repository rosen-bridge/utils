# @rosen-bridge/query-params

## Table of contents

- [Introduction](#introduction)
- [Installation](#installation)

## Introduction

A type-safe URL filter parser that converts query parameters into validated field, sort, and pagination objects

## Installation

npm:

```sh
npm i @rosen-bridge/query-params
```

yarn:

```sh
yarn add @rosen-bridge/query-params
```

## Usage

To use the `FilterParser`, configure it with your allowed fields, sorts, and pagination rules:

```ts
import { FilterParser } from '@rosen-bridge/query-params';

const filterParser = new FilterParser({
  fields: {
    enable: true,
    items: [
      {
        key: 'field1',
        type: 'string',
        operators: ['equal'],
        values: ['value1', 'value2'],
      },
      {
        key: 'field2',
        type: 'string',
        operators: ['contains'],
      },
    ],
  },
  pagination: {
    enable: true,
    limit: {
      min: 1,
      max: 100,
      default: 10,
    },
    offset: {
      min: 0,
      max: 1000,
      default: 0,
    },
  },
  sorts: {
    enable: true,
    items: [
      {
        key: 'key1',
      },
      {
        key: 'key2',
        defaultOrder: 'ASC',
      },
    ],
  },
});

const filter = filterParser.parse(request.url);
```
