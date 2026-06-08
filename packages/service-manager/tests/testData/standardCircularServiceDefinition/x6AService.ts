import { Dependency, ServiceAction, ServiceStatus } from '../../../lib';
import { X6AInterface } from './x6AInterface';
import { X6BInterface } from './x6BInterface';

export class X6A extends X6AInterface {
  static serviceName = 'X6A-overwritten';
  constructor() {
    super();
  }

  protected dependencies: Dependency[] = [
    {
      serviceName: X6BInterface.serviceName,
      allowedStatuses: [ServiceStatus.running],
      action: ServiceAction.start,
    },
  ];

  assemble = (): Promise<boolean> => this.assembleAfter();
  start = (): Promise<boolean> => this.startAfter();
  stop = (): Promise<boolean> => this.stopAfter();
}
