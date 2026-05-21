# @rosen-bridge/semaphore

## Table of contents

- [Introduction](#introduction)
- [Installation](#installation)

## Introduction

This package provides a robust `Semaphore` class that queues up tasks and
ensures that no more than a configured number of tasks (`maxConcurrency`) run
simultaneously.

## Installation

npm:

```sh
npm i @rosen-bridge/semaphore
```

## Usage

```ts
import { Semaphore } from '@rosen-bridge/semaphore';

const pool = new Semaphore(2);
async function myTestFn(id: number) {
  return pool.use(async () => {
    await new Promise((res) => setTimeout(res, 1000));
    return `${id}`;
  });
}
[1, 2, 3, 4, 5].forEach((id) => myTestFn(id));
```
