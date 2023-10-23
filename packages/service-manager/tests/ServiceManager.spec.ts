import { ServiceStatus } from '../lib';
import { ServiceManager } from '../lib';
import { sleep } from './testUtils';
import { X0A, X0B, X0C, X0M } from './testData/hierarchicalStartTestData';
import { X1A, X1B, X1M } from './testData/crashTestData';
import { OneServiceA } from './testData/oneServiceTestData';
import { X2A, X2B, X2C, X2D } from './testData/midwayFailureTestData';
import { X3A, X3B, X3C, X3D } from './testData/diamondTestData';
import { X4A, X4B, X4C, X4D } from './testData/partialStartTestData';
import { R1A, R1B } from './testData/simpleRunningTestData';
import { Y0A, Y0B, Y0C, Y0M } from './testData/hierarchicalStopTestData';

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

  /**
   * @target ServiceManager: Crash After Start Scenario
   * 3 services are depend on each other in hierarchical structure
   * where a service depends on next service in sequential structure
   * last service will crash a few seconds after being started
   * all services should still be dormant after starting A
   * @dependencies
   * @scenario
   * - generate test service manager
   * - generate 3 test services of X1
   * - start service X1A
   * - wait 4.5 seconds
   * - check returned value
   * - check status of all 3 services
   * @expected
   * - returned value should be true
   * - all 3 services should be in dormant status
   */
  it('Crash After Start Scenario', async () => {
    const serviceManager = new ServiceManager();

    const a = new X1A();
    const b = new X1B();
    const m = new X1M();
    const services = [a, b, m];

    services.forEach((service) => serviceManager.register(service));

    const startPromise = serviceManager.start(a.getName());
    await sleep(4.5);
    const res = await startPromise;
    expect(res).toEqual(true);
    expect(serviceManager.getStatus(a.getName())).toEqual(
      ServiceStatus.dormant
    );
    expect(serviceManager.getStatus(b.getName())).toEqual(
      ServiceStatus.dormant
    );
    expect(serviceManager.getStatus(m.getName())).toEqual(
      ServiceStatus.dormant
    );
  }, 5500);

  /**
   * @target ServiceManager: One Service Start Failure Scenario
   * response should be false when service failed to start
   * @dependencies
   * @scenario
   * - generate test service manager
   * - generate 1 test service (OneServiceA)
   * - start service OneServiceA
   * - wait 2 seconds
   * - check returned value
   * - check status of the service
   * @expected
   * - returned value should be false
   * - service should be in dormant status
   */
  it('One Service Start Failure Scenario', async () => {
    const serviceManager = new ServiceManager();

    const a = new OneServiceA();

    serviceManager.register(a);

    const startPromise = serviceManager.start(a.getName());
    await sleep(2);
    const res = await startPromise;
    expect(res).toEqual(false);
    expect(a.getStatus()).toEqual(ServiceStatus.dormant);
  }, 3000);

  /**
   * @target ServiceManager: Midway Start Failure Scenario
   * 4 services are depend on each other in hierarchical structure
   * where a service depends on next service in sequential structure
   * third service fails to start
   * all services except last service (D) should still be dormant after starting A
   * @dependencies
   * @scenario
   * - generate test service manager
   * - generate 4 test services of X2
   * - start service X2A
   * - wait 4.5 seconds
   * - check returned value
   * - check status of all 4 services
   * @expected
   * - returned value should be false
   * - 3 services should be in dormant status
   * - last service should be in running status
   */
  it('Midway Start Failure Scenario', async () => {
    const serviceManager = new ServiceManager();

    const a = new X2A();
    const b = new X2B();
    const c = new X2C();
    const d = new X2D();
    const services = [a, b, c, d];

    services.forEach((service) => serviceManager.register(service));

    const startPromise = serviceManager.start(a.getName());
    await sleep(4.5);
    const res = await startPromise;
    expect(res).toEqual(false);
    expect(serviceManager.getStatus(a.getName())).toEqual(
      ServiceStatus.dormant
    );
    expect(serviceManager.getStatus(b.getName())).toEqual(
      ServiceStatus.dormant
    );
    expect(serviceManager.getStatus(c.getName())).toEqual(
      ServiceStatus.dormant
    );

    expect(serviceManager.getStatus(d.getName())).toEqual(
      ServiceStatus.running
    );
  }, 5500);

  /**
   * @target ServiceManager: Diamond Structure Scenario
   * 4 services are depend on each other in diamond structure
   * where a service depends on two services where they depends
   * on last service
   * starting A should start all of them
   * @dependencies
   * @scenario
   * - generate test service manager
   * - generate 4 test services of X3
   * - start service X3A
   * - wait 4.5 seconds
   * - check returned value
   * - check status of all 4 services
   * @expected
   * - returned value should be true
   * - all 4 services should be in running status
   */
  it('Diamond Structure Scenario', async () => {
    const serviceManager = new ServiceManager();

    const a = new X3A();
    const b = new X3B();
    const c = new X3C();
    const d = new X3D();
    const services = [a, b, c, d];

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
    expect(serviceManager.getStatus(c.getName())).toEqual(
      ServiceStatus.running
    );
    expect(serviceManager.getStatus(d.getName())).toEqual(
      ServiceStatus.running
    );
  }, 5500);

  /**
   * @target ServiceManager: Partial Start Scenario
   * 4 services are depend on each other in tree structure
   * where 3 services depend on last service
   * starting A should only start last service and itself
   * @dependencies
   * @scenario
   * - generate test service manager
   * - generate 4 test services of X4
   * - start service X4A
   * - wait 2.5 seconds
   * - check returned value
   * - check status of all 4 services
   * @expected
   * - returned value should be true
   * - X4A and X4D services should be in running status
   * - X4B and X4C services should be in dormant status
   */
  it('Partial Start Scenario', async () => {
    const serviceManager = new ServiceManager();

    const a = new X4A();
    const b = new X4B();
    const c = new X4C();
    const d = new X4D();
    const services = [a, b, c, d];

    services.forEach((service) => serviceManager.register(service));

    const startPromise = serviceManager.start(a.getName());
    await sleep(2.5);
    const res = await startPromise;
    expect(res).toEqual(true);
    expect(serviceManager.getStatus(a.getName())).toEqual(
      ServiceStatus.running
    );
    expect(serviceManager.getStatus(d.getName())).toEqual(
      ServiceStatus.running
    );

    expect(serviceManager.getStatus(b.getName())).toEqual(
      ServiceStatus.dormant
    );
    expect(serviceManager.getStatus(c.getName())).toEqual(
      ServiceStatus.dormant
    );
  }, 3500);

  /**
   * @target ServiceManager: Simple Running Scenario
   * one service depends on another which has two step start
   * A should be started after B entered running status
   * @dependencies
   * @scenario
   * - generate test service manager
   * - generate 2 test services of R1
   * - start service R1A
   * - wait 1.5 seconds
   * - check status of two services
   * - wait 2.2 seconds
   * - check returned value
   * - check status of two services
   * @expected
   * - returned value should be true
   * - R1A should be in dormant status after first waiting
   * - R1B should be in started status after first waiting
   * - R1A and R1B services should be in running status after second waiting
   */
  it('Simple Running Scenario', async () => {
    const serviceManager = new ServiceManager();

    const a = new R1A();
    const b = new R1B();
    const services = [a, b];

    services.forEach((service) => serviceManager.register(service));

    const startPromise = serviceManager.start(a.getName());
    await sleep(1.5);
    expect(serviceManager.getStatus(a.getName())).toEqual(
      ServiceStatus.dormant
    );
    expect(serviceManager.getStatus(b.getName())).toEqual(
      ServiceStatus.started
    );
    await sleep(2.3);
    expect(serviceManager.getStatus(a.getName())).toEqual(
      ServiceStatus.running
    );
    expect(serviceManager.getStatus(b.getName())).toEqual(
      ServiceStatus.running
    );
    const res = await startPromise;
    expect(res).toEqual(true);
  }, 5000);

  /**
   * @target ServiceManager: Hierarchical Stop Scenario
   * 4 services are depend on each other in hierarchical structure
   * where one service depends on two services (B depends on C and M)
   * stopping C should only stop B and A
   * @dependencies
   * @scenario
   * - generate test service manager
   * - generate 4 test services of Y0
   * - stop service Y0C
   * - wait 2.5 seconds
   * - check returned value
   * - check status of all 4 services
   * @expected
   * - returned value should be true
   * - 3 services should be in dormant status
   * - service M should be in running status
   */
  it('Hierarchical Stop Scenario', async () => {
    const serviceManager = new ServiceManager();

    const a = new Y0A();
    const b = new Y0B();
    const m = new Y0M();
    const c = new Y0C();
    const services = [a, b, c, m];

    services.forEach((service) => serviceManager.register(service));

    const startPromise = serviceManager.stop(c.getName());
    await sleep(2.5);
    const res = await startPromise;
    expect(res).toEqual(true);
    expect(serviceManager.getStatus(a.getName())).toEqual(
      ServiceStatus.dormant
    );
    expect(serviceManager.getStatus(b.getName())).toEqual(
      ServiceStatus.dormant
    );
    expect(serviceManager.getStatus(c.getName())).toEqual(
      ServiceStatus.dormant
    );

    expect(serviceManager.getStatus(m.getName())).toEqual(
      ServiceStatus.running
    );
  }, 3000);
});
