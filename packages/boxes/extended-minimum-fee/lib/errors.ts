export class InvalidConfig extends Error {
  constructor(msg: string) {
    super('InvalidConfig: ' + msg);
  }
}
