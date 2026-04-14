import { Dependency, ServiceAction, ServiceStatus } from '../../lib';
import { TestAbstractService } from '../testAbstractService';

export class I1A extends TestAbstractService {
  name = 'I1A';
  constructor() {
    super(ServiceStatus.running);
  }

  protected dependencies: Dependency[] = [
    {
      serviceName: 'I1B',
      allowedStatuses: [
        ServiceStatus.dormant,
        ServiceStatus.started,
        ServiceStatus.running,
      ],
      action: ServiceAction.initialize,
    },
  ];

  init = (): Promise<boolean> => this.initAfter();
  start = (): Promise<boolean> => this.startAfter();
  stop = (): Promise<boolean> => this.stopAfter();
}

export class I1B extends TestAbstractService {
  name = 'I1B';
  constructor() {
    super(ServiceStatus.running);
  }

  protected dependencies: Dependency[] = [];

  init = (): Promise<boolean> => this.initAfter();
  start = (): Promise<boolean> => this.startAfter();
  stop = (): Promise<boolean> => this.stopAfter();
}
