/* eslint-disable no-unused-vars */
// TODO: there should be no need for above line, as the variables are all defined for an abstract function (local:ergo/rosen-bridge/utils#289)
export abstract class AbstractLogger {
  abstract debug: (message: string, context?: unknown) => unknown;
  abstract info: (message: string, context?: unknown) => unknown;
  abstract warn: (message: string, context?: unknown) => unknown;
  abstract error: (message: string, context?: unknown) => unknown;
}
