# @rosen-bridge/service-manager-cli

## Table of contents

- [Introduction](#introduction)
- [Installation](#installation)
- [Commands](#commands)
  - [dependency-graph](#dependency-graph)
- [Global options](#global-options)
- [Examples](#examples)

## Introduction

A CLI utility for projects that use `@rosen-bridge/service-manager`. It provides developer tools such as generating visual dependency graphs from your service definitions.

## Installation

npm:

```sh
npm i @rosen-bridge/service-manager-cli
```

yarn:

```sh
yarn add @rosen-bridge/service-manager-cli
```

## Commands

### `dependency-graph`

Scans a project directory for service definitions and generates a dependency graph.

```sh
service-manager-cli dependency-graph <path> [options]
```

**Arguments**

| Argument | Description                                   |
| -------- | --------------------------------------------- |
| `path`   | Path to the project root to scan for services |

**Options**

| Option         | Alias | Type                  | Default | Description                                                                  |
| -------------- | ----- | --------------------- | ------- | ---------------------------------------------------------------------------- |
| `--format`     | `-f`  | `svg` \| `dot`        | `svg`   | Output format(s) to generate. Can be specified multiple times.               |
| `--output`     | `-o`  | string                | `graph` | Base name for the output file(s), without extension.                         |
| `--dependency` | `-d`  | `assemble` \| `start` | —       | Filter edges by dependency type.                                             |
| `--service`    | `-s`  | string                | —       | Limit the graph to connections involving a specific service.                 |
| `--verbose`    | `-v`  | boolean               | `false` | Print debug, info, and warning messages in addition to errors and successes. |

Output files are written to the **current working directory** where the command is executed.

## Global options

These options are available for every command.

| Option      | Alias | Description                     |
| ----------- | ----- | ------------------------------- |
| `--version` | `-V`  | Print the CLI version and exit. |
| `--help`    | `-h`  | Show help text and exit.        |

## Examples

**Generate an SVG graph for all services (default behavior)**

```sh
service-manager-cli dependency-graph ./src
```

Produces `graph.svg` in the current directory.

---

**Generate both SVG and DOT formats with a custom file name**

```sh
service-manager-cli dependency-graph ./src -f svg -f dot -o my-services
```

Produces `my-services.svg` and `my-services.dot`.

---

**Show only `assemble`-phase dependencies**

```sh
service-manager-cli dependency-graph ./src -d assemble
```

---

**Focus on a single service**

```sh
service-manager-cli dependency-graph ./src -s payment-service
```

Only edges where `payment-service` appears as a source or target are rendered.

---

**Combine filters with verbose output**

```sh
service-manager-cli dependency-graph ./src -d start -s auth-service -v
```
