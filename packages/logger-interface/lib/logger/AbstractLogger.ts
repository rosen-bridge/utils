export abstract class AbstractLogger {
  abstract info: (message: string, context?: any) => unknown;
  abstract warn: (message: string, context?: any) => unknown;
  abstract error: (message: string, context?: any) => unknown;
  abstract debug: (message: string, context?: any) => unknown;
}
