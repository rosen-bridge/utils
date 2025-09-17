export enum ServiceStatus {
  // eslint-disable-next-line no-unused-vars
  dormant = 'dormant',
  // eslint-disable-next-line no-unused-vars
  started = 'started',
  // eslint-disable-next-line no-unused-vars
  running = 'running',
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
}

export enum ServiceAction {
  // eslint-disable-next-line no-unused-vars
  start = 'start',
  // eslint-disable-next-line no-unused-vars
  stop = 'stop',
}

export interface ActionPromise {
  action: ServiceAction;
  promise: Promise<boolean>;
}

export interface Action {
  // eslint-disable-next-line no-unused-vars
  resolve: (value: boolean | PromiseLike<boolean>) => void;
  // eslint-disable-next-line no-unused-vars
  reject: (reason?: any) => void;
  action: ServiceAction;
}
