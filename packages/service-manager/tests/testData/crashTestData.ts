import { Dependency, ServiceAction, ServiceStatus } from '../../lib';
import { TestAbstractService } from '../testAbstractService';

export class X1A extends TestAbstractService {
  static serviceName = 'X1A';
  constructor() {
    super(ServiceStatus.dormant);
  }

  protected dependencies: Dependency[] = [
    {
      serviceName: 'X1B',
      allowedStatuses: [ServiceStatus.running],
      action: ServiceAction.start,
    },
  ];

  assemble = (): Promise<boolean> => this.assembleAfter();
  start = (): Promise<boolean> => this.startAfter();
  stop = (): Promise<boolean> => this.stopAfter();
}

export class X1B extends TestAbstractService {
  static serviceName = 'X1B';
  constructor() {
    super(ServiceStatus.dormant);
  }

  protected dependencies: Dependency[] = [
    {
      serviceName: 'X1M',
      allowedStatuses: [ServiceStatus.running],
      action: ServiceAction.start,
    },
  ];

  assemble = (): Promise<boolean> => this.assembleAfter();
  start = (): Promise<boolean> => this.startAfter();
  stop = async (): Promise<boolean> => this.stopAfter(1);
}

export class X1M extends TestAbstractService {
  static serviceName = 'X1M';
  constructor() {
    super(ServiceStatus.dormant);
  }

  protected dependencies: Dependency[] = [];

  assemble = (): Promise<boolean> => this.assembleAfter();

  start = (): Promise<boolean> =>
    new Promise((resolve) => {
      setTimeout(() => {
        this.setStatus(ServiceStatus.running);
        resolve(true);
      }, 1000);
      setTimeout(() => {
        this.setStatus(ServiceStatus.dormant);
      }, 1400);
    });

  stop = async (): Promise<boolean> => {
    this.setStatus(ServiceStatus.dormant);
    return true;
  };
}
