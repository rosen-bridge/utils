import { describe, it, expect } from 'vitest';

import { Semaphore } from '../lib';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe('Semaphore', () => {
  describe('use', () => {
    /**
     * @target Semaphore should execute tasks up to the maximum concurrency limit
     * @dependencies
     * - 1 Semaphore instance with maxConcurrency = 2
     * - 5 asynchronous tracker tasks
     * @scenario
     * - initiate Semaphore with a capacity of 2
     * - add 5 tasks simultaneously that track active executions
     * - wait for all tasks to complete using Promise.all
     * @expected
     * - highest concurrent executions should never exceed 2
     * - final active task count should return to 0
     */
    it('should execute tasks up to the maximum concurrency limit', async () => {
      const maxConcurrency = 2;
      const semaphore = new Semaphore(maxConcurrency);

      let currentRunning = 0;
      let highestRunning = 0;

      const trackTask = async () => {
        currentRunning++;
        highestRunning = Math.max(highestRunning, currentRunning);
        await delay(50);
        currentRunning--;
      };

      const promises = Array.from({ length: 5 }).map(() =>
        semaphore.use(trackTask),
      );

      await Promise.all(promises);

      expect(highestRunning).toBe(maxConcurrency);
      expect(currentRunning).toBe(0);
    });

    /**
     * @target Semaphore should release the lock even if a task throws an error
     * @dependencies
     * - 1 Semaphore instance with maxConcurrency = 1
     * - 1 failing task that throws an error
     * - 1 successful task waiting in queue
     * @scenario
     * - start execution of the failing task
     * - immediately queue the successful task behind it
     * - catch and handle the rejection of the first task
     * - await completion of the second task
     * @expected
     * - first task promise should reject with 'Task Failed' error
     * - second task should successfully execute despite the previous failure
     * - second task should return 'done'
     */

    it('should release the lock even if a task throws an error', async () => {
      const semaphore = new Semaphore(1);
      let task2Executed = false;

      const failingTask = async () => {
        await delay(10);
        throw new Error('Task Failed');
      };

      const successTask = async () => {
        await delay(10);
        task2Executed = true;
        return 'done';
      };

      const p1 = semaphore.use(failingTask);
      const p2 = semaphore.use(successTask);

      await expect(p1).rejects.toThrow('Task Failed');

      const result2 = await p2;
      expect(result2).toBe('done');
      expect(task2Executed).toBe(true);
    });

    /**
     * @target Semaphore should process queue order
     * @dependencies
     * - 1 Semaphore instance with maxConcurrency = 1
     * - 3 asynchronous tasks tagged with sequential IDs (1, 2, 3)
     * - an empty array to log the execution order
     * @scenario
     * - push task 1, task 2, and task 3 into the semaphore concurrently
     * - wait for all tasks to push their IDs into the execution log array
     * @expected
     * - the execution log array should deeply equal [1, 2, 3]
     */
    it('should process queue order', async () => {
      const semaphore = new Semaphore(1);
      const executionOrder: number[] = [];

      const createTask = (id: number) => async () => {
        await delay(10);
        executionOrder.push(id);
      };

      await Promise.all([
        semaphore.use(createTask(1)),
        semaphore.use(createTask(2)),
        semaphore.use(createTask(3)),
      ]);

      expect(executionOrder).toEqual([1, 2, 3]);
    });

    /**
     * @target Semaphore should look for setImmediate when process.nextTick is unavailable
     * @dependencies
     * - `process.nextTick` mocked as undefined
     * - A global spy on `setImmediate`
     * - A Semaphore instance with a concurrency limit of 1
     * @scenario
     * - Disable `process.nextTick` by setting it to undefined.
     * - Execute an asynchronous task through `semaphore.use()`.
     * @expected
     * - The internal scheduler triggers `setImmediate` instead of `nextTick`.
     */
    it('should look for setImmediate when process.nextTick is unavailable', async () => {
      if (global.process) {
        (global.process as any).nextTick = undefined;
      }
      const setImmediateSpy = vi.spyOn(global, 'setImmediate');
      const semaphore = new Semaphore(1);
      const createTask = () => async () => {
        await delay(10);
      };
      await Promise.all([semaphore.use(createTask())]);
      expect(setImmediateSpy).toHaveBeenCalled();
    });
  });
});
