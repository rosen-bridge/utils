import { Dependency, ServiceAction, ServiceStatus } from '../../lib';
import { TestAbstractService } from '../testAbstractService';

export class X5A extends TestAbstractService {
  name = 'X5A';
  constructor() {
    super();
  }

  protected dependencies: Dependency[] = [
    {
      serviceName: 'X5B',
      allowedStatuses: [ServiceStatus.running],
      action: ServiceAction.start,
    },
  ];

  assemble = (): Promise<boolean> => this.assembleAfter();
  start = (): Promise<boolean> => this.startAfter();
  stop = (): Promise<boolean> => this.stopAfter();
}

export class X5B extends TestAbstractService {
  name = 'X5B';
  constructor() {
    super();
  }

  protected dependencies: Dependency[] = [
    {
      serviceName: 'X5A',
      allowedStatuses: [
        ServiceStatus.running,
        ServiceStatus.started,
        ServiceStatus.dormant,
      ],
      action: ServiceAction.assemble,
    },
    {
      serviceName: 'X5C',
      allowedStatuses: [
        ServiceStatus.running,
        ServiceStatus.started,
        ServiceStatus.dormant,
      ],
      action: ServiceAction.assemble,
    },
  ];

  assemble = (): Promise<boolean> => this.assembleAfter();
  start = (): Promise<boolean> =>
    new Promise<boolean>((resolve) => {
      setTimeout(() => {
        this.setStatus(ServiceStatus.started);
        resolve(true);
      }, 1000);
      setTimeout(() => {
        this.setStatus(ServiceStatus.running);
        resolve(true);
      }, 2000);
    });
  stop = (): Promise<boolean> => this.stopAfter();
}

export class X5C extends TestAbstractService {
  name = 'X5C';
  constructor() {
    super();
  }

  protected dependencies: Dependency[] = [];

  assemble = (): Promise<boolean> => this.assembleAfter();
  start = (): Promise<boolean> => this.startAfter();
  stop = (): Promise<boolean> => this.stopAfter();
}
