import { Dependency, ServiceStatus } from '../../lib';
import { TestAbstractService } from '../TestAbstractService';

export class X2A extends TestAbstractService {
  name = 'X2A';
  constructor(initialStatus: ServiceStatus) {
    super(initialStatus);
  }

  protected dependencies: Dependency[] = [
    {
      serviceName: 'X2B',
      allowedStatuses: [ServiceStatus.running],
    },
  ];

  start = (): Promise<boolean> => this.startAfter();
  stop = (): Promise<boolean> => this.stopAfter();
}

export class X2B extends TestAbstractService {
  name = 'X2B';
  constructor(initialStatus: ServiceStatus) {
    super(initialStatus);
  }

  protected dependencies: Dependency[] = [
    {
      serviceName: 'X2C',
      allowedStatuses: [ServiceStatus.running],
    },
  ];

  start = (): Promise<boolean> => this.startAfter();
  stop = (): Promise<boolean> =>
    new Promise<boolean>((resolve, reject) => {
      setTimeout(() => {
        resolve(false);
      }, 500);
    });
}

export class X2C extends TestAbstractService {
  name = 'X2C';
  constructor(initialStatus: ServiceStatus) {
    super(initialStatus);
  }

  protected dependencies: Dependency[] = [
    {
      serviceName: 'X2D',
      allowedStatuses: [ServiceStatus.running],
    },
  ];

  start = (): Promise<boolean> =>
    new Promise<boolean>((resolve, reject) => {
      setTimeout(() => {
        resolve(false);
      }, 500);
    });
  stop = (): Promise<boolean> => this.stopAfter();
}

export class X2D extends TestAbstractService {
  name = 'X2D';
  constructor(initialStatus: ServiceStatus) {
    super(initialStatus);
  }

  protected dependencies: Dependency[] = [];

  start = (): Promise<boolean> => this.startAfter();
  stop = (): Promise<boolean> => this.stopAfter();
}
