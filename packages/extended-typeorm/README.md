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

And then all database transaction executed correctly
