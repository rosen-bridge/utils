# @rosen-bridge/address-codec-cardano

## Table of contents

- [Introduction](#introduction)
- [Installation](#installation)
- [Browser bundling](#browser-bundling)

## Introduction

A Typescript package for encoding and decoding of Cardano addresses in Rosen bridge

## Installation

npm:

```sh
npm i @rosen-bridge/address-codec-cardano
```

yarn:

```sh
yarn add @rosen-bridge/address-codec-cardano
```

## Browser bundling

Bundlers that honor the package's `browser` mapping load
`@emurgo/cardano-serialization-lib-browser` 13.2.1. Its WebAssembly module must
finish loading before calling the address codec. Node.js uses
`@emurgo/cardano-serialization-lib-nodejs`.
The codec also requires a browser-compatible `Buffer` implementation.

Upgrade the Node.js and browser dependencies together and verify address encoding
and decoding in both environments before releasing.

For Webpack 5, enable ESM WebAssembly support:

```js
export default {
  experiments: { asyncWebAssembly: true },
};
```

Vite 7.1.9 requires a loader or plugin that supports ESM WebAssembly imports.
