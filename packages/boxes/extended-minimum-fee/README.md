# @rosen-bridge/extended-minimum-fee

## Table of contents

- [Introduction](#introduction)
- [Installation](#installation)
- [Usage](#usage)

## Introduction

`@rosen-bridge/extended-minimum-fee` Typescript package to build and get minimum fee of the bridge for supported tokens from blockchain

## Installation

npm:

```sh
npm i @rosen-bridge/extended-minimum-fee
```

yarn:

```sh
yarn add @rosen-bridge/extended-minimum-fee
```

## Usage

Here's a basic example of how to use this package:

```typescript
import {
  ExtendedMinimumFeeBox,
  MinimumFeeExplorerNetwork,
} from '@rosen-bridge/extended-minimum-fee';

const network = new MinimumFeeExplorerNetwork('URL');
const minimumFeeBox = new ExtendedMinimumFeeBox('TOKEN_ID', 'NFT', network);
await minimumFeeBox.fetchBox();
const builder = minimumFeeBox.toBuilder();
```
