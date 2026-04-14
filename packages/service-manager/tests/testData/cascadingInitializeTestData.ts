import { Dependency, ServiceAction, ServiceStatus } from '../../lib';
import { TestAbstractService } from '../testAbstractService';

export class I0A extends TestAbstractService {
  name = 'I0A';
  constructor() {
    super();
  }

  protected dependencies: Dependency[] = [
    {
      serviceName: 'I0B',
      allowedStatuses: [
        ServiceStatus.running,
        ServiceStatus.started,
        ServiceStatus.dormant,
      ],
      action: ServiceAction.initialize,
    },
  ];

  init = (): Promise<boolean> => this.initAfter();
  start = (): Promise<boolean> => this.startAfter();
  stop = (): Promise<boolean> => this.stopAfter();
}

export class I0B extends TestAbstractService {
  name = 'I0B';
  constructor() {
    super();
  }

  protected dependencies: Dependency[] = [];

  init = (): Promise<boolean> => this.initAfter();
  start = (): Promise<boolean> => this.startAfter();
  stop = (): Promise<boolean> => this.stopAfter();
}
