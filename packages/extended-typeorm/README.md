# @rosen-bridge/extended-typeorm

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
npm i @rosen-bridge/extended-typeorm
```

yarn:

```sh
yarn add @rosen-bridge/extended-typeorm
```

## Usage

```ts
import { DataSource } from '@rosen-bridge/extended-typeorm';

const dataSource = DataSource({
  ...
})
```

Now all database transaction execute correctly without throwing an error, no matter if you call them simultaneously or not.
