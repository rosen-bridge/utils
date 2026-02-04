# @rosen-bridge/interval-timer

<p align="center">
  <a href="https://www.npmjs.com/package/@rosen-bridge/interval-timer"><img src="https://img.shields.io/npm/v/@rosen-bridge/interval-timer"></a>
  <img src="https://img.shields.io/npm/l/@rosen-bridge/interval-timer"></a>
<p>

## Table of contents

- [Description](#description)
- [Installation](#installation)
- [Usage](#usage)

## Description

`IntervalTimer` is a TypeScript class designed for managing the periodic execution of asynchronous callbacks at specified intervals. It ensures that the callback runs only once within a given interval, preventing overlapping executions.

## Key Functionalities

- **Asynchronous Execution**: The timer can handle asynchronous callbacks, allowing for non-blocking operation.
- **Customizable Intervals**: Supports custom execution-interval and check-interval, if the execution of an async callback take more time than execution-interval the check-interval is used to detect when the callback has resolved and immediately runs the callback again.
- **Error Rethrow**: The run-loop of the IntervalTimer does not catch the errors, errors should be handled inside the callback function.

## Installation

```bash
npm install @rosen-bridge/interval-timer
```

## Usage

```ts
import IntervalTimer from '@rosen-bridge/interval-timer';

// Example callback function that returns a promise
const myAsyncCallback = async () => {
  console.log('Timer executed at', new Date().toLocaleTimeString());
  // Simulate async work
  await new Promise((resolve) => setTimeout(resolve, 1000));
};

// Create a new instance of IntervalTimer with a 5 second interval
const timer = new IntervalTimer(5000, myAsyncCallback);

// Start the timer
timer.start();

// To stop the timer, call: timer.stop();
```
