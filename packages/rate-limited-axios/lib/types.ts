import { Semaphore } from 'await-semaphore';

export type Rule = {
  pattern: RegExp;
  semaphore: Semaphore;
  throttleWindow: number;
  timeout: number;
};
