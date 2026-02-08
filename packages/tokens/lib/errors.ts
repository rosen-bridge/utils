export class CorruptedConfigError extends Error {
  constructor(msg: string) {
    super(`CorruptedConfigError: ` + msg);
  }
}
