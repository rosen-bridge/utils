export type LogCallback = (message: string, context?: unknown) => unknown;

export type LogCallbacks = {
  [key: string]: Array<LogCallback>;
};
