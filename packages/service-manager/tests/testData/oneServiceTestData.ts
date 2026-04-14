import { Dependency, ServiceStatus } from '../../lib';
import { TestAbstractService } from '../testAbstractService';

export class OneServiceA extends TestAbstractService {
  name = 'OneServiceA';
  constructor() {
    super(ServiceStatus.dormant);
  }

  protected dependencies: Dependency[] = [];

  init = (): Promise<boolean> => this.initAfter();
  start = (): Promise<boolean> =>
    new Promise<boolean>((resolve) => {
      setTimeout(() => {
        resolve(false);
      }, 1000);
    });
  stop = (): Promise<boolean> => this.stopAfter();
}
