# @rosen-bridge/address-manager

## Table of contents

- [Introduction](#introduction)
- [Installation](#installation)
- [Usage](#usage)

## Introduction

A Typescript package used by Rosen extractors to validate and decode addresses

## Installation

npm:

```sh
npm i @rosen-bridge/address-manager
```

yarn:

```sh
yarn add @rosen-bridge/address-manager
```

## Usage

The `AddressManager` is a singleton class that provides methods to validate and decode addresses of different chains. It should be initialized before use. You can initialize it as follows:

```ts
import { ConsoleLogger } from '@rosen-bridge/abstract-logger';
import { AddressManager } from '@rosen-bridge/address-manager';

const exampleChainValidators = {
  chainX: (address: string) => {
    // validate address
  },
};

const exampleChainDecoder = {
  chainX: (encodedAddress: string) => {
    // decode address
    return `decoded-address`;
  },
};

AddressManager.init(exampleChainValidators, exampleChainDecoder, ConsoleLogger);
const address = AddressManager.getInstance().decodeAddress(
  'chainX',
  'encoded-address',
);
```

Alternatively, you can initialize it with the implementations of `address-codec` package:

```ts
import { ConsoleLogger } from '@rosen-bridge/abstract-logger';
import { chainValidators, chainDecoders } from '@rosen-bridge/address-codec';
import { AddressManager } from '@rosen-bridge/address-manager';

AddressManager.init(chainValidators, chainDecoders, ConsoleLogger);
```
