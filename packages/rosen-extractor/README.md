# @rosen-bridge/rosen-extractor

<p align="center">
  <a href="https://www.npmjs.com/package/@rosen-bridge/rosen-extractor"><img src="https://img.shields.io/npm/v/@rosen-bridge/rosen-extractor"></a>
  <img src="https://img.shields.io/npm/l/@rosen-bridge/rosen-extractor"></a>
<p>

## Table of contents

- [Description](#description)
- [Installation](#installation)
- [Usage](#usage)

## Description

`@rosen-bridge/rosen-extractor` is a core Rosen Bridge module responsible for extracting and validating bridge request data from blockchain transactions. It converts chain-specific transaction data into a standardized bridge request format consumed by Rosen Watcher and Guard services as part of the bridge verification and execution pipeline.

The extractor module is responsible for identifying and parsing bridge requests embedded in transactions across supported blockchains. It achieves this through a set of chain-specific extractors (such as `ErgoNodeRosenExtractor`, `CardanoKoiosExtractor`, and others), each of which understands the transaction structure and data formats of its respective chain and provider.

In addition to raw data extraction, the module performs several validation and normalization steps required by the bridge protocol (note that these steps are taken in the `AbstractRosenExtractor` class):

- Destination addresses are validated against the target chain using `@rosen-bridge/address-codec` package.
- Tokens are resolved through `TokenMap` to ensure the requested asset is supported on both the source and target chains.
- Transfer amounts are normalized to account for differing decimal precisions across blockchains using `TokenMap.wrapAmount`.

The output of the extractor is a normalized bridge request object containing the target chain and address, source transaction information, token identifiers on both chains, transfer amount, and the bridge and network fees specified in the transaction. This object represents the canonical input used by Rosen Watchers for observation and by Guards for verification and signing.

The fees extracted by this package represent the values explicitly declared by the user in the transaction. They do not reflect the effective fees enforced by the protocol. If the specified fees are below the configured minimum fee—defined on-chain on Ergo—the Rosen Guards will apply the minimum fee instead. For more information on fee configuration and enforcement, see the [`@rosen-bridge/minimum-fee`](https://www.npmjs.com/package/@rosen-bridge/minimum-fee) package.

The extracted bridge request data includes the following fields:

- **`toChain`**: Target blockchain
- **`toAddress`**: Destination address on the target blockchain
- **`bridgeFee`**: Bridge fee specified in the transaction
- **`networkFee`**: Network fee specified in the transaction
- **`fromAddress`**: Source address transferring assets to the lock address
- **`sourceChainTokenId`**: Token identifier on the source blockchain
- **`amount`**: Transfer amount
- **`targetChainTokenId`**: Token identifier on the target blockchain
- **`sourceTxId`**: Source transaction identifier
- **`rawData`**: Raw transaction data from which the request was extracted

> Note: The `rawData` field is a small subset of the original transaction data while omitting the irrelevant data. It is included for reference and debugging purposes. For example, on Bitcoin, the `rawData` is the scriptPubKey of OP_RETURN output that contains Rosen data while on Bitcoin-Runes, it is the entire transaction outputs.

There are two functions that can be used to extract the bridge request data:

1. `extractData`: This function takes a transaction data as input and returns the extracted bridge request data. It is implemented in the child classes based on the chain and provider.
2. `get`: This function wraps the `extractData` function and adds additional validation and normalization steps (i.e., validate the destination address and normalize the amount). It is recommended to use this function instead of `extractData` as it provides a more consistent and reliable output. It is implemented in the `AbstractRosenExtractor` class.

## Installation

```sh
npm i @rosen-bridge/rosen-extractor
```

## Usage

To use the class, The transaction data must be provided in the format expected by the specific extractor class being used. Here's a basic example of how to use this package:

```typescript
import { ErgoNodeRosenExtractor } from '@rosen-bridge/rosen-extractor';
import { TokenMap } from '@rosen-bridge/tokens';
import ergoNodeClientFactory from '@rosen-clients/ergo-node';

// generate the Ergo node client
const ergoNodeUrl = '';
const nodeClient = ergoNodeClientFactory(ergoNodeUrl);

// get the transaction from Ergo node
const lockTxId =
  '9115d6d6f22269949de1118f1415e7ef8aa717b232f3c6a3710178475a87af05'; // a sample lock transaction
const tx = await nodeClient.getTxById(lockTxId);

// generate the TokenMap
const tokenMapJson = {}; // you can get the token map json from GitHub releases (https://github.com/rosen-bridge/contract/releases)
const tokenMap = new TokenMap();
await tokenMap.updateConfigByJson(tokenMapJson);

// generate the Rosen Extractor for Ergo Node provider
const ergoLockAddress =
  'nB3L2PD3J4rMmyGk7nnNdESpPXxhPRQ4t1chF8LTXtceMQjKCEgL2pFjPY6cehGjyEFZyHEomBTFXZyqfonvxDozrTtK5JzatD8SdmcPeJNWPvdRb5UxEMXE4WQtpAFzt2veT8Z6bmoWN'; // the Rosen lock address on Ergo the time of the sample
const rosenExtractor = new ErgoNodeRosenExtractor(ergoLockAddress, tokenMap);

// extract and display the Rosen data
const res = rosenExtractor.get(tx);
console.log(res);
```
