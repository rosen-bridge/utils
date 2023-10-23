import { ServiceStatus } from '../lib';
import { ServiceManager } from '../lib';
import { sleep } from './testUtils';
import { X0A, X0B, X0C, X0M } from './testData/hierarchicalStartTestData';

describe('ServiceManager', () => {
  /**
   * @target ServiceManager: Hierarchical Start Scenario
   * 4 services are depend on each other in hierarchical structure
   * where one service depends on two services (B depends on C and M)
   * starting A should start all of them
   * @dependencies
   * @scenario
   * - generate test service manager
   * - generate 4 test services of X0
   * - start service X0A
   * - wait 4.5 seconds
   * - check returned value
   * - check status of all 4 services
   * @expected
   * - returned value should be true
   * - all 4 services should be in running status
   */
  it('Hierarchical Start Scenario', async () => {
    const serviceManager = new ServiceManager();

    const a = new X0A();
    const b = new X0B();
    const m = new X0M();
    const c = new X0C();
    const services = [a, b, m, c];

    services.forEach((service) => serviceManager.register(service));

    const startPromise = serviceManager.start(a.getName());
    await sleep(4.5);
    const res = await startPromise;
    expect(res).toEqual(true);
    expect(serviceManager.getStatus(a.getName())).toEqual(
      ServiceStatus.running
    );
    expect(serviceManager.getStatus(b.getName())).toEqual(
      ServiceStatus.running
    );
    expect(serviceManager.getStatus(m.getName())).toEqual(
      ServiceStatus.running
    );
    expect(serviceManager.getStatus(c.getName())).toEqual(
      ServiceStatus.running
    );
  }, 5500);
});
