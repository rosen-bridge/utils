# @rosen-bridge/tx-pot

## Table of contents

- [Introduction](#introduction)
- [Installation](#installation)
- [Usage](#usage)
  - [Network Interface](#network-interface)
  - [Setup](#setup)
  - [Insert Transaction](#insert-transaction)
  - [Process Signed Transactions](#process-signed-transactions)
  - [Transaction Validations](#transaction-validations)
  - [Status Change Notification](#status-change-notification)
  - [Fetch Transactions](#fetch-transactions)

## Introduction

`@rosen-bridge/tx-pot` is a Typescript package to manage transactions storage, sign, submit and related processes.

## Installation

npm:

```sh
npm i @rosen-bridge/tx-pot
```

yarn:

```sh
yarn add @rosen-bridge/tx-pot
```

## Usage

The usage of `@rosen-bridge/tx-pot` package is explained briefly in several parts. Implementing network interface, setup and insert transaction steps are crucial to use the package. Other steps just explain how to utilize the package and better use cases.

`TxPot` requires a database connection and works with a single table, `TransactionEntity`. The primary key for this table is the pair of chain and transaction id. It also has various columns which will be explained in [#insert-transaction](#insert-transaction).

### Network Interface

Before diving into using `TxPot`, a network interface is required for each chain. The interface should implement the `AbstractPotChainManager` class. These interfaces should be registered in `TxPot` after the setup step. The interface functions are briefly described in the following.

#### `getHeight`

This function gets the blockchain's current height. It is required while processing transactions with `sent` status and is used to update the transaction `lastCheck`, which almost shows the last height that a transaction was valid. It is also required while setting a transaction as invalid.

#### `getTxRequiredConfirmation`

This function returns the required number of confirmations for a transaction based on its type. The transaction types are defined by the superior package and don't matter to `TxPot`.

> ```ts
> @param txType <string> type of the transaction
> ```

#### `getTxConfirmation`

This function gets the number of confirmations for a transaction. **Note that this function should return -1 if tx is not mined (e.g. is in mempool) or is not in the blockchain**.

> ```ts
> @param txId <string> the transaction id
> ```

#### `isTxValid`

This function checks if a transaction is still valid and can be sent to the network. For example, in UTxO-based blockchains, it should check if the input UTxOs are valid and still unspent. Also in Account-based blockchains, the state of the account (e.g. `nonce` in Ethereum) should be checked.

> ```ts
> @param serializedTx <string> the serialized transaction
> @param signingStatus <SigningStatus> the transaction sign status (0 for signed, 1 for unsigned)
> ```

#### `submitTransaction`

This function submits a transaction to the blockchain. The result doesn't matter to `TxPot` and the state of the transaction will be checked while processing `sent` transactions (see [#process-signed-transactions](#process-signed-transactions)).

> ```ts
> @param serializedTx <string> the serialized transaction
> ```

#### `isTxInMempool`

This function checks if a transaction is in mempool. If the blockchain has no mempool or mempool usage is not required, it should just return `false`.

> ```ts
> @param txId <string> the transaction id
> ```

### Setup

`TxPot` is defined in Singleton architecture, i.e. a single object will be defined and used by the entire program.

To instantiate `TxPot`, the `setup` function should get called with `typeorm` data source.

```ts
import { TxPot } from '@rosen-bridge/tx-pot';
import { dataSource } from '../db/dataSource';

const txPot = TxPot.setup(dataSource);
```

A logger can be passed to `TxPot`. Example of integrating `@rosen-bridge/winston-logger` with TxPot:

```ts
import { TxPot } from '@rosen-bridge/tx-pot';
import { dataSource } from '../db/dataSource';
import WinstonLogger from '@rosen-bridge/winston-logger';

const logger = WinstonLogger.getInstance().getLogger(`TxPot`);

const txPot = TxPot.setup(dataSource, logger);
```

After instantiating `TxPot` all supported chains interfaces should be registered in (see [#network-interface](#network-interface) for more details).

```ts
import { ErgoChainManager } from 'managers/ErgoChainManager';
import { CardanoChainManager } from 'managers/CardanoChainManager';

txPot.registerChain(`ergo`, ErgoChainManager);
txPot.registerChain(`cardano`, CardanoChainManager);
```

Validator and callback functions can be registered to `TxPot` but they are optional (see [#transaction-validations](#transaction-validations) and [#status-change-notification](#status-change-notification) for more details).

### Insert Transaction

Transaction can be inserted using the `addTx` function. It inserts transactions with `approved` status by default and 0 for the `lastCheck` column. For inserting signed transactions, the `signed` status should be passed as initial status. In this case, **don't forget to also pass the current blockchain height as `lastCheck` argument**. There are two columns to store arbitrary data for transactions, `extra` and `extra2`. The difference is transactions can be filtered and fetched by their `extra` field while it is not possible with `extra2`. If some foreign key concept is required for transactions, it is suggested to store the key in the `extra` column.

Example of inserting a transaction into `TxPot`:

```ts
await txPot.addTx(
  'a742019b9c3963713dccda20e38717f8854d7d2ede97899f7eba78f67acef10b',
  'ergo',
  'my-type',
  1,
  'your-serialized-tx'
);
```

Example of inserting a signed transaction into `TxPot`:

```ts
import { TransactionStatus } from '@rosen-bridge/tx-pot';

await txPot.addTx(
  'a742019b9c3963713dccda20e38717f8854d7d2ede97899f7eba78f67acef10b',
  'ergo',
  'my-type',
  1,
  'your-serialized-tx',
  TransactionStatus.SIGNED,
  1000000
);
```

Example of inserting a transaction with arbitrary data into `TxPot` (can be combined with above example to insert signed transaction):

```ts
import { TransactionStatus } from '@rosen-bridge/tx-pot';

await txPot.addTx(
  'a742019b9c3963713dccda20e38717f8854d7d2ede97899f7eba78f67acef10b',
  'ergo',
  'my-type',
  1,
  'your-serialized-tx',
  undefined,
  undefined,
  'your-foreign-key',
  '{ yourData: "any-data", secondKey: 100 }'
);
```

Transactions can be inserted with any other statuses, though it is not recommended.

### Process Signed Transactions

Signed transactions are processed by `TxPot` itself. The process will be executed by the `update` function. It is recommended to execute it on the interval based on the minimum blockchain block time. Example:

```ts
const txPotJob = async () => {
  const txPot = await TxPot.getInstance();
  txPot.update().then(() => {
    setTimeout(txPotJob, interval);
  });
};
```

This function only processes transactions with `signed` and `sent` statuses.

Transactions with `signed` status will be validated by the submit validators (if any are registered) and if all are passed, it will be submitted to the network and its status will be updated to `sent`.

Processing `sent` transactions is a bit more complicated. There are three cases.

If the transaction is mined and confirmed enough, its status will be updated to `completed`.

If the transaction is mined but enough confirmation is not passed yet, the `lastCheck` column is updated to the current height of the blockchain.

If the transaction is not mined, it will be searched for in mempool.
If it is in mempool, the `lastCheck` column is updated to the current height of the blockchain.
If it is not in mempool, the transaction will be validated.

There may be two validations here.
The first one is the chain validation, which is the `isTxValid` function in the network interface (described in [Network Interface
](#istxvalid)).
The second one is any registered validator by the superior package (see [#transaction-validations](#transaction-validations) for more details).
**Note that submit validators won't be checked in here**.

If the transaction is still valid, it will be submitted to the network.
If it's not, the `lastCheck` column will be checked and only if enough blocks are passed from it, the status will be updated to `invalid`.

There are other statuses for transactions, but they will not be processed by `TxPot` and the the superior package should process them itself. It is recommended to process them before calling `update`:

```ts
const txPotJob = async () => {
  const txPot = await TxPot.getInstance();

  const approvedTxs = await TxPot.getTxsByStatus(
    TransactionStatus.APPROVED,
    true // only returns valid txs (also mutate invalid ones)
  );
  await processApprovedTxs(approvedTxs);

  const signFailedTxs = await TxPot.getTxsByStatus(
    TransactionStatus.SIGN_FAILED
  );
  await processSignFailedTxs(signFailedTxs);

  txPot.update().then(() => {
    setTimeout(txPotJob, interval);
  });
};
```

The `validate` flag in `getTxsByStatus` arguments specifies if the fetched transactions should be validated. Similar to `sent` transactions, chain validation and the registered validators will be checked.
**Note that submit validators won't be checked in here either**.

Again similar to `sent` transactions, if the transaction is not valid, the `lastCheck` column will be checked and only if enough blocks are passed from it, the status will be updated to `invalid`. The remaining valid transactions will be returned.

### Transaction Validations

There are three types of validators in `TxPot`.
The first one is to validate chain conditions, which are checked by the chain manager (`isTxValid` function described in [Network Interface
](#istxvalid)).
The second one is the validators registered by the superior package using `registerValidator`.
The third one is the submit-only validators, which should be registered by `registerSubmitValidator`. Note that the third one will be called only before attempting to submit a transaction and won't be called in any other cases (such as processing `sent` transactions).

The second type of validator, requires chain, transaction type and an id to be registered. Id only identifies the validator and won't be used while validating transactions.
Multiple validators can be registered for a single chain and transaction type using different ids. Registering a new validator with the same chain, type and id will override the previous one. Example:

```ts
import { s1ErgoPaymentTxValidator } from '../service1/validators';
import { s2ErgoPaymentTxValidator } from '../service1/validators';

txPot.registerValidator(
  `ergo`,
  `payment`,
  `service-1`,
  s1ErgoPaymentTxValidator
);
txPot.registerValidator(
  `ergo`,
  `payment`,
  `service-2`,
  s2ErgoPaymentTxValidator
);
```

the submit-only validators only require chain and id. Similar to the previous one, registering multiple validators is allowed and registering the validator with duplicate chain and id overrides the previous one. Example:

```ts
import { s1ErgoSubmitValidator } from '../service1/validators';

txPot.registerSubmitValidator(`ergo`, `service-1`, s1ErgoSubmitValidator);
```

The validators can also be removed using unregister functions:

```ts
txPot.unregisterValidator(`ergo`, `payment`, `service-1`);

txPot.unregisterSubmitValidator(`ergo`, `service-1`);
```

### Status Change Notification

The superior package can be notified when a transaction status is changed. The notification process will be done based on the transaction type and the new status.

In order to perform an action on status change, a callback should be registered to `TxPot`. Similar to validators, registering multiple callbacks is allowed and registering callback with duplicate type, status and id overrides the previous one. Example:

```ts
import { onPaymentComplete } from '../service1/jobs';

txPot.registerCallback(
  `payment`,
  TransactionStatus.COMPLETED,
  'service-1',
  onPaymentComplete
);
```

Removing callbacks is done by `unregisterCallback`:

```ts
txPot.unregisterCallback(`payment`, TransactionStatus.COMPLETED, 'service-1');
```

### Fetch Transactions

Some functions are defined to update and fetch transactions. The `getTxsQuery` function is defined for general use cases and always returns the list of transactions.
It gets the list of queries and merges the result (technically, queries are merged into a single query with `OR` clause).
Each query supports conditions on six fields of the transaction. The available conditions are described in the following.

#### `txId`

Transactions can be fetched by id in two ways. Fetching transactions with a single id, or list of ids.

```ts
// fetch transactions with single id
txPot.getTxsQuery([
  {
    txId: '48ffe9014a3e3370df3f6eadcaf6ffa2de96cc94f3c4170c65e561beecdb1da9',
  },
]);
// fetch transactions with list of ids
txPot.getTxsQuery([
  {
    txId: [
      '48ffe9014a3e3370df3f6eadcaf6ffa2de96cc94f3c4170c65e561beecdb1da9',
      '377c038d4bf522617ef7a74254be48c97d692787179cb091444ce808b63ced2d',
    ],
  },
]);
```

#### `chain`

Only a single chain can be specified in the query. Example:

```ts
txPot.getTxsQuery([
  {
    chain: 'ergo',
  },
]);
```

#### `txType`

Only a single transaction type can be specified in the query. Example:

```ts
txPot.getTxsQuery([
  {
    txType: 'payment',
  },
]);
```

#### `status`

The status column can be specified in four ways:

- single status

```ts
txPot.getTxsQuery([
  {
    status: {
      not: false,
      value: TransactionStatus.APPROVED,
    },
  },
]);
```

- multiple statuses

```ts
txPot.getTxsQuery([
  {
    status: {
      not: false,
      value: [TransactionStatus.APPROVED, TransactionStatus.SIGN_FAILED],
    },
  },
]);
```

- all statuses except a single one

```ts
txPot.getTxsQuery([
  {
    status: {
      not: true,
      value: TransactionStatus.INVALID,
    },
  },
]);
```

- all statuses except multiple ones

```ts
txPot.getTxsQuery([
  {
    status: {
      not: true,
      value: [TransactionStatus.COMPLETED, TransactionStatus.INVALID],
    },
  },
]);
```

#### `failedInSign`

The `failedInSign` column is also available to query.

```ts
txPot.getTxsQuery([
  {
    failedInSign: true,
  },
]);
```

#### `extra`

similar to `txId`, the `extra` column supports single and multiple value conditions.

```ts
// fetch transactions with single data
txPot.getTxsQuery([
  {
    extra: 'arbitrary-data',
  },
]);
// fetch transactions with list of data
txPot.getTxsQuery([
  {
    extra: ['arbitrary-data-1', 'arbitrary-data-2'],
  },
]);
```

The queries can be combined. Example:

```ts
const unsignedTxsToRetry = {
  status: {
    not: false,
    value: [TransactionStatus.IN_SIGN, TransactionStatus.SIGN_FAILED],
  },
  failedInSign: true,
};

const importantTxs = {
  extra: `important!`,
};

txPot.getTxsQuery([unsignedTxsToRetry, importantTxs]);
```
