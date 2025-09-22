export enum ServiceStatus {
  dormant = 'dormant',

  started = 'started',

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
  start = 'start',

  stop = 'stop',
}

export interface ActionPromise {
  action: ServiceAction;
  promise: Promise<boolean>;
}

export interface Action {
  resolve: (value: boolean | PromiseLike<boolean>) => void;

  reject: (reason?: any) => void;
  action: ServiceAction;
}
