# @rosen-bridge/atomic-typeorm-create-query-runner

## Table of contents

- [Introduction](#introduction)
- [Installation](#installation)
- [Usage](#usage)

## Introduction

By default, typeorm doesn't handle parallel transactions. If you run two
transactions simultaneously and your database doesn't support it (e.g. if you
use sqlite), you will get errors.

## Installation

npm:

```sh
npm i @rosen-bridge/atomic-typeorm-create-query-runner
```

yarn:

```sh
yarn add @rosen-bridge/atomic-typeorm-create-query-runner
```

## Usage

```ts
import createAtomicQueryRunner from '@rosen-bridge/atomic-typeorm-create-query-runner';

const foo = () => {
  // const queryRunner = dataSource.createQueryRunner();
  const queryRunner = createAtomicQueryRunner(dataSource);

  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    await applyAtomicQuery();
    await queryRunner.commitTransaction();
  } catch {
    await queryRunner.rollbackTransaction();
  } finally {
    await queryRunner.release();
  }
};

// You can now call the transactions simultaneously without getting errors
foo();
foo();
```

As you can see, no big changes required to use the package.
