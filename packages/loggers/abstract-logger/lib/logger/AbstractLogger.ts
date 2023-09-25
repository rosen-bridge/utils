export abstract class AbstractLogger {
  abstract info: (message: string, context?: unknown) => unknown;
  abstract warn: (message: string, context?: unknown) => unknown;
  abstract error: (message: string, context?: unknown) => unknown;
  abstract debug: (message: string, context?: unknown) => unknown;
}
