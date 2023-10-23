import { Dependency, ServiceStatus } from '../../lib';
import { TestAbstractService } from '../TestAbstractService';

export class X4A extends TestAbstractService {
  name = 'X4A';
  constructor() {
    super(ServiceStatus.dormant);
  }

  protected dependencies: Dependency[] = [
    {
      serviceName: 'X4D',
      allowedStatuses: [ServiceStatus.running],
    },
  ];

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
    },
  ];

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
    },
  ];

  start = (): Promise<boolean> => this.startAfter();
  stop = (): Promise<boolean> => this.stopAfter();
}

export class X4D extends TestAbstractService {
  name = 'X4D';
  constructor() {
    super(ServiceStatus.dormant);
  }

  protected dependencies: Dependency[] = [];

  start = (): Promise<boolean> => this.startAfter();
  stop = (): Promise<boolean> => this.stopAfter();
}
