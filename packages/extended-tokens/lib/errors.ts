export class CorruptedConfigError extends Error {
  constructor(boxId: string, msg: string) {
    super(`CorruptedConfigError: Corrupted config in box [${boxId}]: ` + msg);
  }
}
