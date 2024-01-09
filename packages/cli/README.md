# @rosen-bridge/cli

## Table of contents

- [Introduction](#introduction)
- [Installation](#installation)
- [Usage](#usage)

## Introduction

`@rosen-bridge/cli` is the official Rosen bridge cli, providing helpers for the
tasks related to Rosen bridge.

## Installation

npm:

```sh
npm i @rosen-bridge/cli
```

yarn:

```sh
yarn add @rosen-bridge/cli
```

## Usage

The cli can be used through `npx`.

```sh
npx @rosen-bridge/cli --help
```

### `download-assets`

Downloads Rosen bridge assets (tokens and addresses files) from
[`contracts`](https://github.com/rosen-bridge/contract) repository on GitHub for
a specific chain type (e.g. mainnet, etc.).

```sh
npx @rosen-bridge/cli download-assets --help
```

#### Examples

Download assets for mainnet into a `rosen` directory.

```sh
npx @rosen-bridge/cli download-assets --chain-type mainnet --out rosen
```

docker solution:

```shell
docker run -it --rm -v "$PWD"/rosen:/usr/src/app/rosen -w /usr/src/app node:18.16 npx --yes @rosen-bridge/cli download-assets --chain-type mainnet --out rosen
```

Download assets for testnet into a `rosen` directory. If some pre-releases are
available for testnet, download them. Add suffix `foo` to all downloaded asset
names.

```sh
npx @rosen-bridge/cli download-assets -c testnet -o rosen --include-prereleases --suffix foo
```

### `tss-secret-generate`

Generate Tss publicKey/secret

```sh
npx @rosen-bridge/cli tss-secret-generate
```

docker solution:

```shell
docker run -it --rm node:18.16 npx --yes @rosen-bridge/cli tss-secret-genrate
```

### `blake2b-hash`

blake2b hash of specified input

```sh
npx @rosen-bridge/cli blake2b-hash [input]
```

#### Examples

Get blake2b hash from `hello`

```sh
npx @rosen-bridge/cli blake2b-hash hello
```

docker solution:

```shell
docker run -it --rm node:18.16 npx --yes @rosen-bridge/cli blake2b-hash hello
```
