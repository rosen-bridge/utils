import { Dependency, ServiceStatus } from '../../lib';
import { TestAbstractService } from '../testAbstractService';

export class R2A extends TestAbstractService {
  name = 'R2A';
  constructor(initialStatus: ServiceStatus) {
    super(initialStatus);
  }

  protected dependencies: Dependency[] = [
    {
      serviceName: 'R2B',
      allowedStatuses: [ServiceStatus.started],
    },
  ];

  start = (): Promise<boolean> =>
    new Promise<boolean>((resolve) => {
      setTimeout(() => {
        this.setStatus(ServiceStatus.started);
        resolve(true);
      }, 2800);
      setTimeout(() => {
        this.setStatus(ServiceStatus.running);
        resolve(true);
      }, 5000);
    });
  stop = (): Promise<boolean> => this.stopAfter();
}

export class R2B extends TestAbstractService {
  name = 'R2B';
  getStatusOfR2B: () => ServiceStatus;
  constructor(
    initialStatus: ServiceStatus,
    getStatusOfR2B: () => ServiceStatus,
  ) {
    super(initialStatus);
    this.getStatusOfR2B = getStatusOfR2B;
  }

  protected dependencies: Dependency[] = [];

  start = (): Promise<boolean> =>
    new Promise<boolean>((resolve) => {
      setTimeout(() => {
        this.setStatus(ServiceStatus.started);
        resolve(true);
      }, 1000);
      // every 2 seconds checks if R2B is started or not. if so, enters running
      let resolveTimer: (value: boolean) => void;
      const timerPromise = new Promise((resolve) => {
        resolveTimer = resolve;
      });
      const runningRetryTimer = setInterval(() => {
        if (this.getStatusOfR2B() === ServiceStatus.started) resolveTimer(true);
      }, 2500);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      timerPromise.then((res) => {
        this.setStatus(ServiceStatus.running);
        clearInterval(runningRetryTimer);
        resolve(true);
      });
    });
  stop = (): Promise<boolean> => this.stopAfter();
}
