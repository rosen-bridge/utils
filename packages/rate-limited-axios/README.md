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
import RateLimiterAxios, { RateLimitedAxiosConfig } from '@rosen-bridge/rate-limited-axios';

RateLimiterAxiosConfig.addRule('^http://google.com/.*$', 10, 30);
RateLimiterAxiosConfig.addRule('^http://yahoo.com/.*$', 10, 30);
RateLimiterAxiosConfig.addRule('^http://bing.com/.*$', 10, 30);
.
.
.
const axiosClient = new RateLimitedAxios();
for (let i = 0; i < 10; i++)
  axiosClient.get(url);
```

After this initialization, all packages that import and use @rosen-bridge/rate-limited-axios will respect the configured request limits, ensuring consistent throttling behavior across your entire application.
