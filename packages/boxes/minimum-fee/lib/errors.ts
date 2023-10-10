export class InvalidConfig extends Error {
  constructor(msg: string) {
    super('InvalidConfig: ' + msg);
  }
}

export class FailedError extends Error {
  constructor(msg: string) {
    super('FailedError: ' + msg);
  }
}

export class NetworkError extends Error {
  constructor(msg: string) {
    super('NetworkError: ' + msg);
  }
}

export class UnexpectedApiError extends Error {
  constructor(msg: string) {
    super('UnexpectedApiError: ' + msg);
  }
}

export class NotFoundError extends Error {
  constructor(msg: string) {
    super('NotFoundError: ' + msg);
  }
}
