import { AbstractLogger } from './abstractLogger';

export class DummyLogger extends AbstractLogger {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  debug = (_: string): void => {
    return;
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  error = (_: string): void => {
    return;
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  info = (_: string): void => {
    return;
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  warn = (_: string): void => {
    return;
  };
}
