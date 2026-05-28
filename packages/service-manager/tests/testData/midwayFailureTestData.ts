import { Dependency, ServiceAction, ServiceStatus } from '../../lib';
import { TestAbstractService } from '../testAbstractService';

export class X2A extends TestAbstractService {
  static name = 'X2A';
  constructor(initialStatus: ServiceStatus) {
    super(initialStatus);
  }

  protected dependencies: Dependency[] = [
    {
      serviceName: 'X2B',
      allowedStatuses: [ServiceStatus.running],
      action: ServiceAction.start,
    },
  ];

  assemble = (): Promise<boolean> => this.assembleAfter();
  start = (): Promise<boolean> => this.startAfter();
  stop = (): Promise<boolean> => this.stopAfter();
}

export class X2B extends TestAbstractService {
  static name = 'X2B';
  constructor(initialStatus: ServiceStatus) {
    super(initialStatus);
  }

  protected dependencies: Dependency[] = [
    {
      serviceName: 'X2C',
      allowedStatuses: [ServiceStatus.running],
      action: ServiceAction.start,
    },
  ];

  assemble = (): Promise<boolean> => this.assembleAfter();
  start = (): Promise<boolean> => this.startAfter();
  stop = (): Promise<boolean> =>
    new Promise<boolean>((resolve) => {
      setTimeout(() => {
        resolve(false);
      }, 500);
    });
}

export class X2C extends TestAbstractService {
  static name = 'X2C';
  constructor(initialStatus: ServiceStatus) {
    super(initialStatus);
  }

  protected dependencies: Dependency[] = [
    {
      serviceName: 'X2D',
      allowedStatuses: [ServiceStatus.running],
      action: ServiceAction.start,
    },
  ];

  assemble = (): Promise<boolean> => this.assembleAfter();
  start = (): Promise<boolean> =>
    new Promise<boolean>((resolve) => {
      setTimeout(() => {
        resolve(false);
      }, 500);
    });
  stop = (): Promise<boolean> => this.stopAfter();
}

export class X2D extends TestAbstractService {
  static name = 'X2D';
  constructor(initialStatus: ServiceStatus) {
    super(initialStatus);
  }

  protected dependencies: Dependency[] = [];

  assemble = (): Promise<boolean> => this.assembleAfter();
  start = (): Promise<boolean> => this.startAfter();
  stop = (): Promise<boolean> => this.stopAfter();
}
