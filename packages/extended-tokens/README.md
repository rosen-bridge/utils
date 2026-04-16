# @rosen-bridge/extended-tokens

## Table of contents

- [Introduction](#introduction)
- [Installation](#installation)
- [Usage](#usage)

## Introduction

An extended version of @rosen-bridge/tokens package which enables parsing of TokenMap from Ergo boxes.

## Installation

npm:

```sh
npm i @rosen-bridge/extended-tokens
```

yarn:

```sh
yarn add @rosen-bridge/extended-tokens
```

## Usage

Here's a basic example of how to use this package:

```typescript
import * as wasm from 'ergo-lib-wasm-nodejs';

import { parseTokenMapBoxes } from '@rosen-bridge/extended-tokens';
import JsonBigInt from '@rosen-bridge/json-bigint';
import ergoNodeClientFactory from '@rosen-clients/ergo-node';

// Fetch the token map config boxes from the Ergo Node
const nodeClient = ergoNodeClientFactory(ergoNodeUrl);
const tokenMapNFT = '123456789abcdef'; // token id of token map NFT
const res = await nodeClient.getBoxesByTokenIdUnspent(tokenMapNFT);
const configBoxes = res.filter(
  (box) =>
    box.assets?.find((token) => token.tokenId === tokenMapNFT)?.amount === 1n,
);

// Serialized the boxes
const serializedBoxes = configBoxes.map((boxJson) =>
  Buffer.from(
    wasm.ErgoBox.from_json(
      JsonBigInt.stringify(boxJson),
    ).sigma_serialize_bytes(),
  ).toString('hex'),
);

// Parse the token map JSON from the boxes
const tokens = parseTokenMapBoxes(serializedBoxes);
console.log(tokens);
```

Alternatively, you can use the `ExtendedTokenMap` class and parse the boxes directly:

```typescript
const tokenMap = new ExtendedTokenMap();
await tokenMap.updateConfigByBoxes(serializedBoxes);
console.log(tokenMap.getTokens());
```
