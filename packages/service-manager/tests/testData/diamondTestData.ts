import { Dependency, ServiceAction, ServiceStatus } from '../../lib';
import { TestAbstractService } from '../testAbstractService';

export class X3A extends TestAbstractService {
  static name = 'X3A';
  constructor() {
    super(ServiceStatus.dormant);
  }

  protected dependencies: Dependency[] = [
    {
      serviceName: 'X3B',
      allowedStatuses: [ServiceStatus.running],
      action: ServiceAction.start,
    },
    {
      serviceName: 'X3C',
      allowedStatuses: [ServiceStatus.running],
      action: ServiceAction.start,
    },
  ];

  assemble = (): Promise<boolean> => this.assembleAfter();
  start = (): Promise<boolean> => this.startAfter();
  stop = (): Promise<boolean> => this.stopAfter();
}

export class X3B extends TestAbstractService {
  static name = 'X3B';
  constructor() {
    super(ServiceStatus.dormant);
  }

  protected dependencies: Dependency[] = [
    {
      serviceName: 'X3D',
      allowedStatuses: [ServiceStatus.running],
      action: ServiceAction.start,
    },
  ];

  assemble = (): Promise<boolean> => this.assembleAfter();
  start = (): Promise<boolean> => this.startAfter();
  stop = (): Promise<boolean> => this.stopAfter();
}

export class X3C extends TestAbstractService {
  static name = 'X3C';
  constructor() {
    super(ServiceStatus.dormant);
  }

  protected dependencies: Dependency[] = [
    {
      serviceName: 'X3D',
      allowedStatuses: [ServiceStatus.running],
      action: ServiceAction.start,
    },
  ];

  assemble = (): Promise<boolean> => this.assembleAfter();
  start = (): Promise<boolean> => this.startAfter();
  stop = (): Promise<boolean> => this.stopAfter();
}

export class X3D extends TestAbstractService {
  static name = 'X3D';
  constructor() {
    super(ServiceStatus.dormant);
  }

  protected dependencies: Dependency[] = [];

  assemble = (): Promise<boolean> => this.assembleAfter();
  start = (): Promise<boolean> => this.startAfter();
  stop = (): Promise<boolean> => this.stopAfter();
}
