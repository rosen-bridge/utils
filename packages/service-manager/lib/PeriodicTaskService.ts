import { AbstractService } from './AbstractService';
import { ServiceStatus } from './types';

type Task = {
  fn: () => Promise<void>;
  interval: number;
};

interface TaskManager extends Task {
  finished: Promise<void>;
}

export abstract class PeriodicTaskService extends AbstractService {
  private timeouts: Map<string, NodeJS.Timeout | number> = new Map();
  private active = false;
  private taskManagers: TaskManager[] = [];

  /**
   * This method is called before the service starts.
   * It is used to prepare the service for starting the periodic tasks.
   */
  protected abstract preStart(): Promise<void>;

  /**
   * This method is called after the service stops.
   * It is used to clean up the service after the periodic tasks have stopped.
   */
  protected abstract postStop(): Promise<void>;

  /**
   * This method is used to get the tasks to be executed periodically.
   * Tasks are defined as a list of objects with a function and an interval.
   */
  protected abstract getTasks(): Task[];

  /**
   * starts the periodic service and schedules all defined tasks.
   *
   * @returns {Promise<boolean>} Resolves to true if started successfully.
   */
  protected start = async (): Promise<boolean> => {
    try {
      let taskIdGenerator = 0;
      this.logger.info(`Starting periodic task service [${this.name}]`);
      await this.preStart();
      this.setStatus(ServiceStatus.running);
      this.active = true;

      /**
       * returns a list of tasks with their associated functions and intervals.
       *
       * @returns {Task[]} Array of task objects containing the function and interval.
       */
      const tasks = this.getTasks();
      this.taskManagers = tasks.map(({ fn, interval }) => {
        const taskManager: TaskManager = {
          fn,
          interval,
          finished: new Promise<void>((resolve) => {
            const taskId = `task_${taskIdGenerator++}_${fn.name}`;
            const cycle = async () => {
              if (!this.active) {
                resolve();
                return;
              }

              try {
                await fn();
              } catch (err) {
                this.logger.warn(`Error in executing task ${fn.name}: ${err}`);
              }

              if (this.active) {
                const timeout = setTimeout(cycle, interval);
                this.timeouts.set(taskId, timeout);
              } else {
                resolve();
              }
            };
            cycle();
          }),
        };

        return taskManager;
      });

      return true;
    } catch (err) {
      this.logger.error(
        `Failed to start periodic task service [${this.name}]: ${err}`
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
      this.logger.info(`Stopping periodic task service [${this.name}]`);
      this.active = false;
      const stopPromises = this.taskManagers.map(async (taskManager) => {
        try {
          await taskManager.finished;
          this.logger.debug(`Task [${taskManager.fn.name}] finished`);
        } catch (err) {
          this.logger.error(
            `Error in stopping task [${taskManager.fn.name}]: ${err}`
          );
        }
      });

      this.logger.debug(
        `Awaiting all tasks to finish before stopping service.`
      );
      await Promise.all(stopPromises);
      this.logger.debug(`finishing all tasks before stopping service.`);
      this.timeouts.forEach((timeout, taskId) => {
        clearTimeout(timeout);
        this.logger.debug(`Cleared timeout for task [${taskId}]`);
      });
      this.timeouts.clear();
      await this.postStop();
      this.setStatus(ServiceStatus.dormant);
      this.logger.info(
        `Periodic task service [${this.name}] stopped successfully.`
      );
      return true;
    } catch (err) {
      this.logger.error(
        `Failed to stop periodic task service [${this.name}]: ${err}`
      );
      return false;
    }
  };
}
