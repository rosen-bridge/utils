import { AbstractLogger } from './AbstractLogger';

export class DummyLogger extends AbstractLogger {
  debug = (_: string): void => {
    return;
  };

  error = (_: string): void => {
    return;
  };

  info = (_: string): void => {
    return;
  };

  warn = (_: string): void => {
    return;
  };
}
