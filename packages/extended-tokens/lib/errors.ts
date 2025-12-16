export class CorruptedConfigBoxError extends Error {
  constructor(boxId: string, msg: string) {
    super(
      `CorruptedConfigBoxError: Corrupted config in box [${boxId}]: ` + msg,
    );
  }
}
