export class Semaphore {
  private tasks: (() => void)[] = [];
  private count: number;

  /**
   * Creates an instance of a Semaphore.
   * @param count - The maximum number of tasks allowed to run concurrently.
   */
  constructor(count: number) {
    this.count = count;
  }

  /**
   * Internal scheduler that processes the task queue.
   * Decrements the available count and executes the next waiting task if slots are free.
   * @private
   */
  private sched = (): void => {
    if (this.count > 0 && this.tasks.length > 0) {
      this.count--;
      const next = this.tasks.shift()!;
      next();
    }
  };

  /**
   * Manually acquires a slot in the semaphore.
   * Returns a Promise that resolves once a slot becomes available.
   *
   * @returns A promise resolving to a release function `() => void`.
   */
  public acquire = () => {
    return new Promise<() => void>((resolve) => {
      var task = () => {
        var released = false;
        resolve(() => {
          if (!released) {
            released = true;
            this.count++;
            this.sched();
          }
        });
      };
      this.tasks.push(task);
      if (process && process.nextTick) {
        process.nextTick(this.sched.bind(this));
      } else {
        setImmediate(this.sched.bind(this));
      }
    });
  };

  /**
   * Safely executes an asynchronous function within a semaphore slot.
   */
  public use = <T>(f: () => Promise<T>) => {
    return this.acquire().then((release) => {
      return f()
        .then((res) => {
          release();
          return res;
        })
        .catch((err) => {
          release();
          throw err;
        });
    });
  };
}

export class Mutex extends Semaphore {
  constructor() {
    super(1);
  }
}
