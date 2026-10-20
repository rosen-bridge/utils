import { GroupCondition } from './groupCondition.js';

/**
 * The `any` condition: at least one listed condition holds.
 */
export class AnyCondition extends GroupCondition {
  /**
   * The kind of the condition, `any`.
   */
  get kind(): string {
    return 'any';
  }

  /**
   * Whether some condition holds.
   * @param config - the read configuration
   * @param at - the configuration path of the value, with real indexes
   */
  evaluate(config: unknown, at: readonly string[]): boolean {
    return this.conditions.some((condition) => condition.evaluate(config, at));
  }
}
