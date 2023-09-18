# @rosen-bridge/json-bigint

## Table of contents

- [@rosen-bridge/json-bigint](#rosen-bridgejson-bigint)
  - [Table of contents](#table-of-contents)
  - [Introduction](#introduction)
  - [Installation](#installation)
- [Usage](#usage)

## Introduction

A wrapper to json-bigint package with pre-set configurations

## Installation

npm:

```sh
npm i @rosen-bridge/json-bigint
```

yarn:

```sh
yarn add @rosen-bridge/json-bigint
```

# Usage

```ts
import JsonBigInt from '@rosen-bridge/json-bigint';

const json = {
  a: 100000000000000000000n,
  b: 1n,
};
const jsonString = '{"a":100000000000000000000,"b":1}';

const parsedJson = JsonBigInt.parse(jsonString);
const stringifiedJson = JsonBigInt.stringify(json);
```
