import { Dependency, ServiceStatus } from '../../lib';
import { TestAbstractService } from '../TestAbstractService';

export class OneServiceA extends TestAbstractService {
  name = 'OneServiceA';
  constructor() {
    super(ServiceStatus.dormant);
  }

  protected dependencies: Dependency[] = [];

  start = (): Promise<boolean> =>
    new Promise<boolean>((resolve, reject) => {
      setTimeout(() => {
        resolve(false);
      }, 1000);
    });
  stop = (): Promise<boolean> => this.stopAfter();
}
