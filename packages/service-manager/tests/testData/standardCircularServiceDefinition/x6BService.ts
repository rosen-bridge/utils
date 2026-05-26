import { Dependency, ServiceAction, ServiceStatus } from '../../../lib';
import { X6A } from './x6AService';
import { X6BInterface } from './x6BInterface';

export class X6B extends X6BInterface {
  constructor() {
    super();
  }

  protected dependencies: Dependency[] = [
    {
      serviceName: X6A.name, // X6A overwrites it's name
      allowedStatuses: [
        ServiceStatus.running,
        ServiceStatus.started,
        ServiceStatus.dormant,
      ],
      action: ServiceAction.assemble,
    },
  ];

  assemble = (): Promise<boolean> => this.assembleAfter();
  start = (): Promise<boolean> =>
    new Promise<boolean>((resolve) => {
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
