# @rosen-bridge/address-codec-ergo

## Table of contents

- [Introduction](#introduction)
- [Installation](#installation)
- [Browser bundling](#browser-bundling)

## Introduction

A Typescript package for encoding and decoding of Ergo addresses in Rosen bridge

## Installation

npm:

```sh
npm i @rosen-bridge/address-codec-ergo
```

yarn:

```sh
yarn add @rosen-bridge/address-codec-ergo
```

## Browser bundling

Bundlers that honor the package's `browser` mapping load
`ergo-lib-wasm-browser` 0.24.1. Its WebAssembly module must finish loading before
calling the address codec. Node.js uses `ergo-lib-wasm-nodejs`.
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
