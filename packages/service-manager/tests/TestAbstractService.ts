import { AbstractService, ServiceStatus } from '../lib';

export abstract class TestAbstractService extends AbstractService {
  constructor(initialStatus: ServiceStatus) {
    super();
    this.setStatus(initialStatus);
  }

  startAfter = (seconds = 1) =>
    new Promise<boolean>((resolve, reject) => {
      setTimeout(() => {
        this.setStatus(ServiceStatus.running);
        resolve(true);
      }, seconds * 1000);
    });

  stopAfter = (seconds = 0.5) =>
    new Promise<boolean>((resolve, reject) => {
      setTimeout(() => {
        this.setStatus(ServiceStatus.dormant);
        resolve(true);
      }, seconds * 1000);
    });
}
