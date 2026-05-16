import { Dependency, ServiceAction, ServiceStatus } from '../../lib';
import { TestAbstractService } from '../testAbstractService';

export class X4A extends TestAbstractService {
  name = 'X4A';
  constructor() {
    super(ServiceStatus.dormant);
  }

  protected dependencies: Dependency[] = [
    {
      serviceName: 'X4D',
      allowedStatuses: [ServiceStatus.running],
      action: ServiceAction.start,
    },
  ];

  assemble = (): Promise<boolean> => this.assembleAfter();
  start = (): Promise<boolean> => this.startAfter();
  stop = (): Promise<boolean> => this.stopAfter();
}

export class X4B extends TestAbstractService {
  name = 'X4B';
  constructor() {
    super(ServiceStatus.dormant);
  }

  protected dependencies: Dependency[] = [
    {
      serviceName: 'X4D',
      allowedStatuses: [ServiceStatus.running],
      action: ServiceAction.start,
    },
  ];

  assemble = (): Promise<boolean> => this.assembleAfter();
  start = (): Promise<boolean> => this.startAfter();
  stop = (): Promise<boolean> => this.stopAfter();
}

export class X4C extends TestAbstractService {
  name = 'X4C';
  constructor() {
    super(ServiceStatus.dormant);
  }

  protected dependencies: Dependency[] = [
    {
      serviceName: 'X4D',
      allowedStatuses: [ServiceStatus.running],
      action: ServiceAction.start,
    },
  ];

  assemble = (): Promise<boolean> => this.assembleAfter();
  start = (): Promise<boolean> => this.startAfter();
  stop = (): Promise<boolean> => this.stopAfter();
}

export class X4D extends TestAbstractService {
  name = 'X4D';
  constructor() {
    super(ServiceStatus.dormant);
  }

  protected dependencies: Dependency[] = [];

  assemble = (): Promise<boolean> => this.assembleAfter();
  start = (): Promise<boolean> => this.startAfter();
  stop = (): Promise<boolean> => this.stopAfter();
}
