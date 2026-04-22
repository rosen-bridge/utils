import { Dependency, ServiceAction, ServiceStatus } from '../../lib';
import { TestAbstractService } from '../testAbstractService';

export class I0A extends TestAbstractService {
  name = 'I0A';
  constructor(initialStatus?: ServiceStatus) {
    super(initialStatus);
  }

  protected dependencies: Dependency[] = [
    {
      serviceName: 'I0B',
      allowedStatuses: [
        ServiceStatus.running,
        ServiceStatus.started,
        ServiceStatus.dormant,
      ],
      action: ServiceAction.assemble,
    },
  ];

  assemble = (): Promise<boolean> => this.assembleAfter();
  start = (): Promise<boolean> => this.startAfter();
  stop = (): Promise<boolean> => this.stopAfter();
}

export class I0B extends TestAbstractService {
  name = 'I0B';
  constructor(initialStatus?: ServiceStatus) {
    super(initialStatus);
  }

  protected dependencies: Dependency[] = [];

  assemble = (): Promise<boolean> => this.assembleAfter();
  start = (): Promise<boolean> => this.startAfter();
  stop = (): Promise<boolean> => this.stopAfter();
}
