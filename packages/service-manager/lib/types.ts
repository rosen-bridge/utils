export enum ServiceStatus {
  raw = 'raw',
  dormant = 'dormant',
  started = 'started',
  running = 'running',
}

export enum ServiceAction {
  start = 'start',
  stop = 'stop',
  initialize = 'initialize',
}

export interface Task {
  fn: () => Promise<void>;
  interval: number;
}

export interface TaskManager extends Task {
  finished: Promise<void>;
}

export interface Dependency {
  serviceName: string;
  allowedStatuses: Array<ServiceStatus>;
  action: ServiceAction;
}

export interface ActionPromise {
  action: ServiceAction;
  promise: Promise<boolean>;
}

export interface Action {
  resolve: (value: boolean | PromiseLike<boolean>) => void;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  reject: (reason?: any) => void;
  action: ServiceAction;
}
