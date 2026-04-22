import { ServiceManager, ServiceStatus } from '../lib';
import { I0A, I0B } from './testData/cascadingAssembleTestData';
import { X1A, X1B, X1M } from './testData/crashTestData';
import { X3A, X3B, X3C, X3D } from './testData/diamondTestData';
import { X0A, X0B, X0C, X0M } from './testData/hierarchicalTestData';
import { X2A, X2B, X2C, X2D } from './testData/midwayFailureTestData';
import { OneServiceA } from './testData/oneServiceTestData';
import { X4A, X4B, X4C, X4D } from './testData/partialStartTestData';
import { R1A, R1B } from './testData/simpleRunningTestData';
import { X5A, X5B, X5C } from './testData/validCircularTestData';
import { sleep } from './testUtils';

describe('ServiceManager', () => {
  /**
   * @target ServiceManager should perform the Hierarchical Start Scenario successfully
   * @dependencies
   * - 4 dormant services
   *   - A depends on B for start
   *   - B depends on C and M for start
   *   - C has no dependency
   *   - M has no dependency
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
  it('should perform the Hierarchical Start Scenario successfully', async () => {
    const serviceManager = ServiceManager.setup();

    const a = new X0A(ServiceStatus.dormant);
    const b = new X0B(ServiceStatus.dormant);
    const m = new X0M(ServiceStatus.dormant);
    const c = new X0C(ServiceStatus.dormant);
    const services = [a, b, m, c];

    services.forEach((service) => serviceManager.register(service));

    const startPromise = serviceManager.start(a.getName());
    await sleep(4.5);
    const res = await startPromise;
    expect(res).toEqual(true);
    expect(serviceManager.getStatus(a.getName())).toEqual(
      ServiceStatus.running,
    );
    expect(serviceManager.getStatus(b.getName())).toEqual(
      ServiceStatus.running,
    );
    expect(serviceManager.getStatus(m.getName())).toEqual(
      ServiceStatus.running,
    );
    expect(serviceManager.getStatus(c.getName())).toEqual(
      ServiceStatus.running,
    );
  }, 5500);

  /**
   * @target ServiceManager should perform the Crash After Start Scenario successfully
   * @dependencies
   * - 3 dormant services
   *   - A depends on B for start
   *   - B depends on C for start
   *   - C has no dependency
   *   - C crashes a few seconds after being started
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
  it('should perform the Crash After Start Scenario successfully', async () => {
    const serviceManager = ServiceManager.setup();

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
      ServiceStatus.dormant,
    );
    expect(serviceManager.getStatus(b.getName())).toEqual(
      ServiceStatus.dormant,
    );
    expect(serviceManager.getStatus(m.getName())).toEqual(
      ServiceStatus.dormant,
    );
  }, 5500);

  /**
   * @target ServiceManager should perform the One Service Start Failure Scenario successfully
   * @dependencies
   * - 1 dormant service, which fails to start
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
  it('should perform the One Service Start Failure Scenario successfully', async () => {
    const serviceManager = ServiceManager.setup();

    const a = new OneServiceA();

    serviceManager.register(a);

    const startPromise = serviceManager.start(a.getName());
    await sleep(2);
    const res = await startPromise;
    expect(res).toEqual(false);
    expect(a.getStatus()).toEqual(ServiceStatus.dormant);
  }, 3000);

  /**
   * @target ServiceManager should perform the Midway Start Failure Scenario successfully
   * @dependencies
   * - 4 dormant services
   *   - A depends on B for start
   *   - B depends on C for start
   *   - C depends on D for start
   *   - C fails to start
   *   - D has no dependency
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
  it('should perform the Midway Start Failure Scenario successfully', async () => {
    const serviceManager = ServiceManager.setup();

    const a = new X2A(ServiceStatus.dormant);
    const b = new X2B(ServiceStatus.dormant);
    const c = new X2C(ServiceStatus.dormant);
    const d = new X2D(ServiceStatus.dormant);
    const services = [a, b, c, d];

    services.forEach((service) => serviceManager.register(service));

    const startPromise = serviceManager.start(a.getName());
    await sleep(4.5);
    const res = await startPromise;
    expect(res).toEqual(false);
    expect(serviceManager.getStatus(a.getName())).toEqual(
      ServiceStatus.dormant,
    );
    expect(serviceManager.getStatus(b.getName())).toEqual(
      ServiceStatus.dormant,
    );
    expect(serviceManager.getStatus(c.getName())).toEqual(
      ServiceStatus.dormant,
    );

    expect(serviceManager.getStatus(d.getName())).toEqual(
      ServiceStatus.running,
    );
  }, 5500);

  /**
   * @target ServiceManager should perform the Diamond Structure Scenario successfully
   * @dependencies
   * - 4 dormant services
   *   - A depends on B and C for start
   *   - B depends on D for start
   *   - C depends on D for start
   *   - D has no dependency
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
  it('should perform the Diamond Structure Scenario successfully', async () => {
    const serviceManager = ServiceManager.setup();

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
      ServiceStatus.running,
    );
    expect(serviceManager.getStatus(b.getName())).toEqual(
      ServiceStatus.running,
    );
    expect(serviceManager.getStatus(c.getName())).toEqual(
      ServiceStatus.running,
    );
    expect(serviceManager.getStatus(d.getName())).toEqual(
      ServiceStatus.running,
    );
  }, 5500);

  /**
   * @target ServiceManager should perform the Partial Start Scenario successfully
   * @dependencies
   * - 4 dormant services
   *   - A depends on D for start
   *   - B depends on D for start
   *   - C depends on D for start
   *   - D has no dependency
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
  it('should perform the Partial Start Scenario successfully', async () => {
    const serviceManager = ServiceManager.setup();

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
      ServiceStatus.running,
    );
    expect(serviceManager.getStatus(d.getName())).toEqual(
      ServiceStatus.running,
    );

    expect(serviceManager.getStatus(b.getName())).toEqual(
      ServiceStatus.dormant,
    );
    expect(serviceManager.getStatus(c.getName())).toEqual(
      ServiceStatus.dormant,
    );
  }, 3500);

  /**
   * @target ServiceManager should perform the Simple Running Scenario successfully
   * one service depends on another which has two step start
   * A should be started after B entered running status
   * @dependencies
   * - 2 dormant services
   *   - A depends on B for start (only running status allowed)
   *   - B has no dependency
   *   - B starts after a few seconds
   *   - B enters running status after a few more seconds
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
  it('should perform the Simple Running Scenario successfully', async () => {
    const serviceManager = ServiceManager.setup();

    const a = new R1A(ServiceStatus.dormant);
    const b = new R1B(ServiceStatus.dormant);
    const services = [a, b];

    services.forEach((service) => serviceManager.register(service));

    const startPromise = serviceManager.start(a.getName());
    await sleep(1.5);
    expect(serviceManager.getStatus(a.getName())).toEqual(
      ServiceStatus.dormant,
    );
    expect(serviceManager.getStatus(b.getName())).toEqual(
      ServiceStatus.started,
    );
    await sleep(2.3);
    expect(serviceManager.getStatus(a.getName())).toEqual(
      ServiceStatus.running,
    );
    expect(serviceManager.getStatus(b.getName())).toEqual(
      ServiceStatus.running,
    );
    const res = await startPromise;
    expect(res).toEqual(true);
  }, 5000);

  /**
   * @target ServiceManager should perform the Hierarchical Stop Scenario successfully
   * @dependencies
   * - 4 running services
   *   - A depends on B for start
   *   - B depends on C and M for start
   *   - C has no dependency
   *   - M has no dependency
   * @scenario
   * - generate test service manager
   * - generate 4 test services of X0
   * - stop service X0C
   * - wait 2.5 seconds
   * - check returned value
   * - check status of all 4 services
   * @expected
   * - returned value should be true
   * - 3 services should be in dormant status
   * - service M should be in running status
   */
  it('should perform the Hierarchical Stop Scenario successfully', async () => {
    const serviceManager = ServiceManager.setup();

    const a = new X0A(ServiceStatus.running);
    const b = new X0B(ServiceStatus.running);
    const m = new X0M(ServiceStatus.running);
    const c = new X0C(ServiceStatus.running);
    const services = [a, b, c, m];

    services.forEach((service) => serviceManager.register(service));

    const startPromise = serviceManager.stop(c.getName());
    await sleep(2.5);
    const res = await startPromise;
    expect(res).toEqual(true);
    expect(serviceManager.getStatus(a.getName())).toEqual(
      ServiceStatus.dormant,
    );
    expect(serviceManager.getStatus(b.getName())).toEqual(
      ServiceStatus.dormant,
    );
    expect(serviceManager.getStatus(c.getName())).toEqual(
      ServiceStatus.dormant,
    );

    expect(serviceManager.getStatus(m.getName())).toEqual(
      ServiceStatus.running,
    );
  }, 3000);

  /**
   * @target ServiceManager should perform the Midway Stop Failure Scenario successfully
   * @dependencies
   * - 4 running services
   *   - A depends on B for start
   *   - B depends on C for start
   *   - B fails to stop
   *   - C depends on D for start
   *   - D has no dependency
   * @scenario
   * - generate test service manager
   * - generate 4 test services of X2
   * - stop service X2D
   * - wait 2.5 seconds
   * - check returned value
   * - check status of all 4 services
   * @expected
   * - returned value should be false
   * - 3 services should be in running status
   * - first service should be in dormant status
   */
  it('should perform the Midway Stop Failure Scenario successfully', async () => {
    const serviceManager = ServiceManager.setup();

    const a = new X2A(ServiceStatus.running);
    const b = new X2B(ServiceStatus.running);
    const c = new X2C(ServiceStatus.running);
    const d = new X2D(ServiceStatus.running);
    const services = [a, b, c, d];

    services.forEach((service) => serviceManager.register(service));

    const startPromise = serviceManager.stop(d.getName());
    await sleep(2.5);
    const res = await startPromise;
    expect(res).toEqual(false);
    expect(serviceManager.getStatus(b.getName())).toEqual(
      ServiceStatus.running,
    );
    expect(serviceManager.getStatus(c.getName())).toEqual(
      ServiceStatus.running,
    );
    expect(serviceManager.getStatus(d.getName())).toEqual(
      ServiceStatus.running,
    );

    expect(serviceManager.getStatus(a.getName())).toEqual(
      ServiceStatus.dormant,
    );
  }, 3500);

  /**
   * @target ServiceManager should perform the Running Downgrade Scenario successfully
   * one service depends on another
   * on downgrading B status from running to started service manager
   * should stop service A
   * @dependencies
   * - 2 running services
   *   - A depends on B for start (only running status allowed)
   *   - B has no dependency
   * @scenario
   * - generate test service manager
   * - generate 2 test services of R1
   * - change service R1B status to started
   * - wait 1.5 seconds
   * - check status of two services
   * @expected
   * - R1A should be in dormant status
   * - R1B should be in started status
   */
  it('should perform the Running Downgrade Scenario successfully', async () => {
    const serviceManager = ServiceManager.setup();

    const a = new R1A(ServiceStatus.running);
    const b = new R1B(ServiceStatus.running);
    const services = [a, b];

    services.forEach((service) => serviceManager.register(service));

    b.callSetStatus(ServiceStatus.started);
    await sleep(1.5);
    expect(serviceManager.getStatus(a.getName())).toEqual(
      ServiceStatus.dormant,
    );
    expect(serviceManager.getStatus(b.getName())).toEqual(
      ServiceStatus.started,
    );
  }, 2000);

  /**
   * @target ServiceManager should perform the Cascading Assemble Scenario successfully
   * @dependencies
   * - 2 raw services
   *   - A depends on B for assemble
   *   - B has no dependency
   * @scenario
   * - generate test service manager
   * - generate 2 test services of I0
   * - call assemble on I0A
   * - wait 2.5 seconds
   * - check returned value
   * - check status of both services
   * @expected
   * - returned value should be true
   * - both I0A and I0B should be in dormant status
   */
  it('should perform the Cascading Assemble Scenario successfully', async () => {
    const serviceManager = ServiceManager.setup();

    const a = new I0A();
    const b = new I0B();
    const services = [a, b];

    services.forEach((service) => serviceManager.register(service));

    const initPromise = serviceManager.assemble(a.getName());
    await sleep(2.5);
    const res = await initPromise;
    expect(res).toEqual(true);
    expect(serviceManager.getStatus(a.getName())).toEqual(
      ServiceStatus.dormant,
    );
    expect(serviceManager.getStatus(b.getName())).toEqual(
      ServiceStatus.dormant,
    );
  }, 3500);

  /**
   * @target ServiceManager should perform the Assemble on Start Scenario successfully
   * @dependencies
   * - 2 raw services
   *   - A depends on B for assemble
   *   - B has no dependency
   * @scenario
   * - generate test service manager
   * - generate 2 test services of I0
   * - call start on I0A
   * - wait 2.5 seconds
   * - check returned value
   * - check status of both services
   * @expected
   * - returned value should be true
   * - I0A should be in running status
   * - I0B should be in dormant status (assembled but not started)
   */
  it('should perform the Assemble on Start Scenario successfully', async () => {
    const serviceManager = ServiceManager.setup();

    const a = new I0A();
    const b = new I0B();
    const services = [a, b];
    services.forEach((service) => serviceManager.register(service));

    const startPromise = serviceManager.start(a.getName());
    await sleep(2.5);
    const res = await startPromise;
    expect(res).toEqual(true);
    expect(serviceManager.getStatus(a.getName())).toEqual(
      ServiceStatus.running,
    );
    expect(serviceManager.getStatus(b.getName())).toEqual(
      ServiceStatus.dormant,
    );
  }, 3500);

  /**
   * @target ServiceManager should perform the Stop Propagation Relation with Assemble Scenario successfully
   * @dependencies
   * - 2 running services
   *   - A depends on B for assemble
   *   - B has no dependency
   * @scenario
   * - generate test service manager
   * - generate 2 test services: I1A (running) and I1B (running)
   * - call stop on I1B
   * - wait 1 second
   * - check returned value
   * - check status of both services
   * @expected
   * - returned value should be true
   * - I1B should be in dormant status
   * - I1A should remain in running status (not stopped)
   */
  it('should perform the Stop Propagation Relation with Assemble Scenario successfully', async () => {
    const serviceManager = ServiceManager.setup();

    const a = new I0A(ServiceStatus.running);
    const b = new I0B(ServiceStatus.running);
    const services = [a, b];
    services.forEach((service) => serviceManager.register(service));

    const stopPromise = serviceManager.stop(b.getName());
    await sleep(1);
    const res = await stopPromise;
    expect(res).toEqual(true);
    expect(serviceManager.getStatus(b.getName())).toEqual(
      ServiceStatus.dormant,
    );
    expect(serviceManager.getStatus(a.getName())).toEqual(
      ServiceStatus.running,
    );
  }, 2000);

  /**
   * @target ServiceManager should perform the Valid Circular Scenario successfully
   * @dependencies
   * - 3 raw services
   *   - A depends on B for start
   *   - B depends on A and C for assemble
   *   - C has no dependency
   * @scenario
   * - generate test service manager
   * - generate 3 test services of X5
   * - call start on X5A
   * - wait 0.5 seconds
   * - check status of three services
   * - wait 1 second
   * - check status of three services
   * - wait 1 second
   * - check status of three services
   * - wait 1 second
   * - check status of three services
   * - wait 1 second
   * - check status of three services
   * - wait 1 second
   * - check status of three services
   * - wait 1 second
   * - check returned value
   * - check status of three services
   * @expected
   * - after 1st waiting
   *   - X5A should be in raw status
   *   - X5B should be in raw status
   *   - X5C should be in raw status
   * - after 2nd waiting
   *   - X5A should be in dormant status
   *   - X5B should be in raw status
   *   - X5C should be in raw status
   * - after 3rd waiting
   *   - X5A should be in dormant status
   *   - X5B should be in raw status
   *   - X5C should be in dormant status
   * - after 4th waiting
   *   - X5A should be in dormant status
   *   - X5B should be in dormant status
   *   - X5C should be in dormant status
   * - after 5th waiting
   *   - X5A should be in dormant status
   *   - X5B should be in started status
   *   - X5C should be in dormant status
   * - after 6th waiting
   *   - X5A should be in raw status
   *   - X5B should be in running status
   *   - X5C should be in dormant status
   * - at the end (after 7th waiting)
   *   - X5A should be in running status
   *   - X5B should be in running status
   *   - X5C should be in dormant status
   * - returned value should be true
   */
  it('should perform the Valid Circular Scenario successfully', async () => {
    const serviceManager = ServiceManager.setup();

    const a = new X5A();
    const b = new X5B();
    const c = new X5C();
    const services = [a, b, c];
    services.forEach((service) => serviceManager.register(service));

    const stopPromise = serviceManager.start(a.getName());
    await sleep(0.5);
    expect(serviceManager.getStatus(a.getName())).toEqual(ServiceStatus.raw);
    expect(serviceManager.getStatus(b.getName())).toEqual(ServiceStatus.raw);
    expect(serviceManager.getStatus(c.getName())).toEqual(ServiceStatus.raw);
    await sleep(1);
    expect(serviceManager.getStatus(a.getName())).toEqual(
      ServiceStatus.dormant,
    );
    expect(serviceManager.getStatus(b.getName())).toEqual(ServiceStatus.raw);
    expect(serviceManager.getStatus(c.getName())).toEqual(ServiceStatus.raw);
    await sleep(1);
    expect(serviceManager.getStatus(a.getName())).toEqual(
      ServiceStatus.dormant,
    );
    expect(serviceManager.getStatus(b.getName())).toEqual(ServiceStatus.raw);
    expect(serviceManager.getStatus(c.getName())).toEqual(
      ServiceStatus.dormant,
    );
    await sleep(1);
    expect(serviceManager.getStatus(a.getName())).toEqual(
      ServiceStatus.dormant,
    );
    expect(serviceManager.getStatus(b.getName())).toEqual(
      ServiceStatus.dormant,
    );
    expect(serviceManager.getStatus(c.getName())).toEqual(
      ServiceStatus.dormant,
    );
    await sleep(1);
    expect(serviceManager.getStatus(a.getName())).toEqual(
      ServiceStatus.dormant,
    );
    expect(serviceManager.getStatus(b.getName())).toEqual(
      ServiceStatus.started,
    );
    expect(serviceManager.getStatus(c.getName())).toEqual(
      ServiceStatus.dormant,
    );
    await sleep(1);
    expect(serviceManager.getStatus(a.getName())).toEqual(
      ServiceStatus.dormant,
    );
    expect(serviceManager.getStatus(b.getName())).toEqual(
      ServiceStatus.running,
    );
    expect(serviceManager.getStatus(c.getName())).toEqual(
      ServiceStatus.dormant,
    );
    await sleep(1);
    const res = await stopPromise;
    expect(res).toEqual(true);
    expect(serviceManager.getStatus(a.getName())).toEqual(
      ServiceStatus.running,
    );
    expect(serviceManager.getStatus(b.getName())).toEqual(
      ServiceStatus.running,
    );
    expect(serviceManager.getStatus(c.getName())).toEqual(
      ServiceStatus.dormant,
    );
  }, 10000);
});
