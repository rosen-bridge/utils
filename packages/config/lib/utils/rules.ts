import type { RuleElement } from '../elements/rules/ruleElement.js';
import { intersect } from './arrays.js';

/**
 * The values allowed by every rule that limits a value to a list
 * (`RuleElement.allowedValues`), or `undefined` when none does.
 * @param rules - the rules of a type
 */
export const allowedByAll = (
  rules: readonly RuleElement[],
): unknown[] | undefined =>
  intersect(
    rules.flatMap((rule) => {
      const values = rule.allowedValues();
      return values === undefined ? [] : [values];
    }),
  );
