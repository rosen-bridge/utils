import { Dependency, ServiceStatus } from '../../lib';
import { TestAbstractService } from '../TestAbstractService';

export class R1A extends TestAbstractService {
  name = 'R1A';
  constructor(initialStatus: ServiceStatus) {
    super(initialStatus);
  }

  protected dependencies: Dependency[] = [
    {
      serviceName: 'R1B',
      allowedStatuses: [ServiceStatus.running],
    },
  ];

  start = (): Promise<boolean> => this.startAfter();
  stop = (): Promise<boolean> => this.stopAfter();
}

export class R1B extends TestAbstractService {
  name = 'R1B';
  constructor(initialStatus: ServiceStatus) {
    super(initialStatus);
  }

  protected dependencies: Dependency[] = [];

  start = (): Promise<boolean> =>
    new Promise<boolean>((resolve, reject) => {
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
