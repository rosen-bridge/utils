export abstract class AbstractLogger {
  abstract debug: (message: string, context?: unknown) => unknown;
  abstract info: (message: string, context?: unknown) => unknown;
  abstract warn: (message: string, context?: unknown) => unknown;
  abstract error: (message: string, context?: unknown) => unknown;
}
