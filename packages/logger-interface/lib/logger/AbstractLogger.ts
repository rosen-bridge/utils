export abstract class AbstractLogger {
  abstract info: (message: string) => unknown;
  abstract warn: (message: string) => unknown;
  abstract error: (message: string) => unknown;
  abstract debug: (message: string) => unknown;
}
