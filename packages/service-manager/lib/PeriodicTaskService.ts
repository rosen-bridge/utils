import { AbstractService } from './AbstractService';
import { ServiceStatus } from './types';

type TimeoutConfig = {
  id: string;
  intervalMs: number;
};

export abstract class PeriodicTaskService extends AbstractService {
  protected abstract readonly taskName: string;

  private timeouts: Map<string, NodeJS.Timeout> = new Map();
  private active = false;

  /**
   * Process logic for a single execution cycle of the specified task.
   *
   * @param {string} id - Identifier of the task to process.
   * @returns {Promise<void>}
   */
  protected abstract processCycle(id: string): Promise<void>;

  /**
   * returns a list of configurations defining each periodic task.
   *
   * @returns {TimeoutConfig[]} Array of task configurations.
   */
  protected abstract getTimeoutConfigs(): TimeoutConfig[];

  /**
   * starts the periodic service and schedules all defined tasks.
   *
   * @returns {Promise<boolean>} Resolves to true if started successfully.
   */
  protected start = async (): Promise<boolean> => {
    this.setStatus(ServiceStatus.running);
    this.active = true;

    this.logger.info(`Starting periodic task service [${this.taskName}]`);

    const configs = this.getTimeoutConfigs();
    configs.forEach(({ id, intervalMs }) => {
      const cycle = async () => {
        if (!this.active) return;
        try {
          await this.processCycle(id);
        } catch (err) {
          this.logger.error(
            `Error in task [${id}] of service [${this.getName()}]: ${err}`
          );
        }
        if (this.active) {
          const timeout = setTimeout(cycle, intervalMs);
          this.timeouts.set(id, timeout);
        }
      };
      cycle();
    });

    return true;
  };

  /**
   * Stops the periodic service and clears all active task timeouts.
   *
   * @returns {Promise<boolean>} Resolves to true if stopped successfully.
   */
  protected stop = async (): Promise<boolean> => {
    this.setStatus(ServiceStatus.dormant);
    this.active = false;
    this.logger.info(`Stopping periodic task service [${this.taskName}]`);

    for (const [id, timeout] of this.timeouts) {
      clearTimeout(timeout);
      this.logger.debug(`Cleared timeout for task [${id}]`);
    }
    this.timeouts.clear();

    return true;
  };
}
