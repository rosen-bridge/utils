import { RULE_KEYS } from '../../constants/index.js';
import { createReading } from '../../parsing/reading.js';
import { ParseResult, all, fail, ok } from '../../parsing/result.js';
import { formatValue } from '../../utils/format.js';
import { isNonEmptyArray } from '../../utils/guards.js';
import { ScalarElement } from '../types/scalar/scalarElement.js';
import { SCALAR_TYPES } from '../types/scalar/scalarTypes.js';
import type { TypeElement } from '../types/typeElement.js';
import { RuleElement } from './ruleElement.js';

/**
 * A value an `enum` rule can list.
 */
export type EnumValue = string | number | bigint | boolean;

/**
 * The `enum` rule (`{ kind: 'enum', choices: [...] }`): a value is one of
 * `choices`.
 */
export class EnumRule extends RuleElement {
  readonly targets: readonly string[] = [
    'string',
    'number',
    'bigint',
    'boolean',
  ];

  protected readonly keys: readonly string[] = [...RULE_KEYS, 'choices'];

  protected choices: readonly EnumValue[];

  /**
   * The kind of the rule, `enum`.
   */
  get kind(): string {
    return 'enum';
  }

  /**
   * Clones the rule with its choices.
   * @param copy - the new, empty rule to fill
   */
  protected cloneExtra = (copy: EnumRule): void => {
    copy.choices = [...this.choices];
  };

  /**
   * Checks that a value is one of the choices; a value that is not set passes.
   * @param value - the converted value, `undefined` when not set
   */
  protected evaluate = (value: unknown): string | undefined => {
    if (value === undefined) return undefined;
    return this.choices.includes(value as EnumValue)
      ? undefined
      : `must be one of ${this.choices.map(formatValue).join(', ')}`;
  };

  /**
   * The choices, unless the rule has a `when`.
   */
  allowedValues = (): readonly EnumValue[] | undefined => {
    return this.conditional() ? undefined : this.choices;
  };

  /**
   * Parses the required `choices`, each converted with the `transform` of the
   * target type (`"8080"` for a number) and distinct from the others.
   * @param node - the rule node
   */
  protected parseExtra = (node: Record<string, unknown>): ParseResult<void> => {
    const { target } = this;
    const list = this.parseKey(
      node,
      'choices',
      isNonEmptyArray,
      'a non-empty array',
    );
    if (!list.ok) return list;
    const element = SCALAR_TYPES.find((item) => item.prototype.kind === target);
    const type: TypeElement | undefined =
      element && new element(this.scope, this.pointer, []);
    if (!(type instanceof ScalarElement))
      throw new Error(
        `${this.constructor.name} cannot be applied to a ${JSON.stringify(target)} type`,
      );
    const choices = all(
      list.value.map((value, index) =>
        type.transform(
          value,
          this.pointerOf('choices', index),
          createReading('value'),
        ),
      ),
    );
    if (!choices.ok) return choices;
    const errors = choices.value.flatMap((choice, index) =>
      choices.value.indexOf(choice) === index
        ? []
        : [this.problem('value is repeated', 'choices', index)],
    );
    if (errors.length > 0) return fail(errors);
    this.choices = choices.value as EnumValue[];
    return ok(undefined);
  };
}
