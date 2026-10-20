import { ParseResult, ok } from '../../../parsing/result.js';
import { resolveCompared } from '../../../utils/evaluators.js';
import { TypeElement } from '../../types/typeElement.js';
import { CompareCondition } from './compareCondition.js';

/**
 * Base of the conditions that order two values (`gt`, `gte`, `lt`, `lte`):
 * both sides are set and in the order the subclass requires. The sides are
 * numbers, bigints or strings (in UTF-16 code-unit order), of one kind as
 * every compared side. A subclass only defines its `kind` and `compare`.
 */
export abstract class OrderCondition extends CompareCondition {
  /**
   * The kinds of the scalar types whose values can be ordered.
   */
  private readonly ordered: readonly string[] = ['number', 'bigint', 'string'];

  /**
   * Resolves and binds both sides, then checks that they can be ordered: a
   * `boolean` cannot.
   * @param root - the parsed root type
   * @param at - the configuration path of the node whose rule has it
   */
  resolve = (root: TypeElement, at: readonly string[]): ParseResult<void> => {
    const resolved = resolveCompared([this.left, this.right], root, at);
    if (!resolved.ok) return resolved;
    const kind = (this.left.type ?? this.right.type)?.kind;
    return kind !== undefined && this.ordered.includes(kind)
      ? ok(undefined)
      : this.error(
          `${this.kind} orders numbers, bigints or strings, not a ${kind}`,
        );
  };
}
