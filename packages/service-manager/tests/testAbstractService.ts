import { AbstractService, ServiceStatus } from '../lib';

export abstract class TestAbstractService extends AbstractService {
  constructor(initialStatus?: ServiceStatus) {
    super();
    if (initialStatus) this.setStatus(initialStatus);
  }

  callSetStatus = (status: ServiceStatus): void => {
    this.setStatus(status);
  };

  initAfter = (seconds = 1): Promise<boolean> =>
    new Promise<boolean>((resolve) => {
      setTimeout(() => {
        this.setStatus(ServiceStatus.dormant);
        resolve(true);
      }, seconds * 1000);
    });

  startAfter = (seconds = 1) =>
    new Promise<boolean>((resolve) => {
      setTimeout(() => {
        this.setStatus(ServiceStatus.running);
        resolve(true);
      }, seconds * 1000);
    });

  stopAfter = (seconds = 0.5) =>
    new Promise<boolean>((resolve) => {
      setTimeout(() => {
        this.setStatus(ServiceStatus.dormant);
        resolve(true);
      }, seconds * 1000);
    });
}
