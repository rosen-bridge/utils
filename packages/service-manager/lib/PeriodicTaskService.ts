import { resolve } from 'path';
import { AbstractService } from './AbstractService';
import { ServiceStatus } from './types';

type Task = {
  fn: () => Promise<void>;
  interval: number;
};

interface TaskManager extends Task {
  isRunning: boolean;
  finished: Promise<void>;
}

export abstract class PeriodicTaskService extends AbstractService {
  protected abstract readonly taskName: string;

  private timeouts: Map<string, NodeJS.Timeout | number> = new Map();
  private active = false;
  private taskManagers: TaskManager[] = [];
  protected abstract starterService(): Promise<void>;
  protected abstract stoperService(): Promise<void>;

  /**
   * returns a list of tasks with their associated functions and intervals.
   *
   * @returns {Task[]} Array of task objects containing the function and interval.
   */
  protected abstract getTasks(): Task[];

  /**
   * starts the periodic service and schedules all defined tasks.
   *
   * @returns {Promise<boolean>} Resolves to true if started successfully.
   */
  protected start = async (): Promise<boolean> => {
    try {
      this.logger.info(`Starting periodic task service [${this.taskName}]`);
      await this.starterService();

      this.setStatus(ServiceStatus.running);
      this.active = true;

      const tasks = this.getTasks();
      this.taskManagers = tasks.map(({ fn, interval }) => {
        const taskManager: TaskManager = {
          fn,
          interval,
          isRunning: false,
          finished: new Promise<void>((resolve) => {
            const cycle = async () => {
              if (!this.active) return resolve();

              try {
                this.logger.debug(`Running task: ${fn.name}`);
                await fn();
                this.logger.debug(`Finished task: ${fn.name}`);
              } catch (err) {
                this.logger.error(`Error in executing task ${fn.name}: ${err}`);
              }

              if (this.active) {
                const timeout = setTimeout(cycle, interval);
                this.timeouts.set(fn.name, timeout);
              }
            };

            taskManager.isRunning = true;
            cycle();
          }),
        };

        return taskManager;
      });

      return true;
    } catch (err) {
      this.logger.error(
        `Failed to start periodic task service [${this.taskName}]: ${err}`
      );
      return false;
    }
  };

  /**
   * Stops the periodic service and clears all active task timeouts.
   *
   * @returns {Promise<boolean>} Resolves to true if stopped successfully.
   */
  protected stop = async (): Promise<boolean> => {
    try {
      this.logger.info(`Stopping periodic task service [${this.taskName}]`);
      this.active = false;
      await this.stoperService();

      const stopPromises = this.taskManagers.map(async (taskManager) => {
        try {
          if (taskManager.isRunning) {
            await taskManager.finished;
          }
        } catch (err) {
          this.logger.error(
            `Error in stopping task [${taskManager.fn.name}]: ${err}`
          );
        }
      });

      await Promise.all(stopPromises);

      this.timeouts.forEach((timeout, fnName) => {
        clearTimeout(timeout);
        this.logger.debug(`Cleared timeout for task [${fnName}]`);
      });
      this.timeouts.clear();

      this.setStatus(ServiceStatus.dormant);
      return true;
    } catch (err) {
      this.logger.error(
        `Failed to stop periodic task service [${this.taskName}]: ${err}`
      );
      return false;
    }
  };
}
