# @rosen-bridge/rate-limited-axios

## Table of contents

- [Introduction](#introduction)
- [Installation](#installation)
- [Usage](#usage)

## Introduction

A lightweight rate-limiting interceptor for Axios that helps control the number of HTTP requests and prevent API throttling.

## Installation

npm:

```sh
npm i @rosen-bridge/rate-limited-axios
```

yarn:

```sh
yarn add @rosen-bridge/rate-limited-axios
```

## Usage

To enable global rate-limiting across your application, you should initialize the configuration once at the entry point of your project (e.g., index.ts or bootstrap.ts):

```ts
import RateLimiterAxios from '@rosen-bridge/rate-limited-axios';
import { getConfig } from './config';

RateLimiterAxios.initConfigs({
  apiLimitRateRangeAsMilliseconds: 10,
  apiLimitRules: [{ pattern: '^.*$', rateLimit: 50 }],
});
```

After this initialization, all packages that import and use @rosen-bridge/rate-limited-axios will respect the configured request limits, ensuring consistent throttling behavior across your entire application.
