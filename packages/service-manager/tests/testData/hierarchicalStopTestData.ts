import { Dependency, ServiceStatus } from '../../lib';
import { TestAbstractService } from '../TestAbstractService';

export class Y0A extends TestAbstractService {
  name = 'Y0A';
  constructor() {
    super(ServiceStatus.running);
  }

  protected dependencies: Dependency[] = [
    {
      serviceName: 'Y0B',
      allowedStatuses: [ServiceStatus.running],
    },
  ];

  start = (): Promise<boolean> => this.startAfter();
  stop = (): Promise<boolean> => this.stopAfter();
}

export class Y0B extends TestAbstractService {
  name = 'Y0B';
  constructor() {
    super(ServiceStatus.running);
  }

  protected dependencies: Dependency[] = [
    {
      serviceName: 'Y0M',
      allowedStatuses: [ServiceStatus.running],
    },
    {
      serviceName: 'Y0C',
      allowedStatuses: [ServiceStatus.running],
    },
  ];

  start = (): Promise<boolean> => this.startAfter();
  stop = (): Promise<boolean> => this.stopAfter();
}

export class Y0C extends TestAbstractService {
  name = 'Y0C';
  constructor() {
    super(ServiceStatus.running);
  }

  protected dependencies: Dependency[] = [];

  start = (): Promise<boolean> => this.startAfter();
  stop = (): Promise<boolean> => this.stopAfter();
}

export class Y0M extends TestAbstractService {
  name = 'Y0M';
  constructor() {
    super(ServiceStatus.running);
  }

  protected dependencies: Dependency[] = [];

  start = (): Promise<boolean> => this.startAfter();
  stop = (): Promise<boolean> => this.stopAfter();
}
