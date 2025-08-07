import { AbstractService } from './AbstractService';
import { ServiceStatus } from './types';

type Task = {
  fn: () => Promise<void>;
  interval: number;
};

export abstract class PeriodicTaskService extends AbstractService {
  protected abstract readonly taskName: string;

  private timeouts: Map<string, NodeJS.Timeout | number> = new Map();
  private active = false;
  private continueStop?: () => void;
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
      tasks.forEach(({ fn, interval }) => {
        const cycle = async () => {
          if (!this.active) return;

          try {
            await fn();
          } catch (err) {
            this.logger.error(
              `Error in executing periodic task for service [${this.getName()}]: ${err}`
            );
          }

          if (this.active) {
            const timeout = setTimeout(cycle, interval);
            this.timeouts.set(fn.name, timeout);
          }
        };

        cycle();
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

      await this.stoperService();
      this.active = false;

      const stopAllTasks = new Promise<void>((resolve) => {
        this.continueStop = resolve;
      });

      const tasks = this.getTasks();
      const taskPromises = tasks.map(
        ({ fn }) =>
          new Promise<void>((resolve) => {
            const cycleFinished = async () => {
              if (!this.active) return resolve();

              try {
                await fn();
                resolve();
              } catch (err) {
                this.logger.error(
                  `Error in stopping task [${this.getName()}]: ${err}`
                );
                resolve();
              }
            };

            cycleFinished();
          })
      );

      await Promise.all(taskPromises);

      await Promise.all(taskPromises);

      for (const [fnName, timeout] of this.timeouts) {
        if (timeout) {
          clearTimeout(timeout);
          this.logger.debug(`Cleared timeout for task [${fnName}]`);
        }
      }
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
