import { GroupCondition } from './groupCondition.js';

/**
 * The `all` condition: every listed condition holds.
 */
export class AllCondition extends GroupCondition {
  /**
   * The kind of the condition, `all`.
   */
  get kind(): string {
    return 'all';
  }

  /**
   * Whether every condition holds.
   * @param config - the read configuration
   * @param at - the configuration path of the value, with real indexes
   */
  evaluate(config: unknown, at: readonly string[]): boolean {
    return this.conditions.every((condition) => condition.evaluate(config, at));
  }
}
