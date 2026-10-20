import {
  PATTERN_FLAGS,
  RULE_KEYS,
  UNICODE_FLAG,
} from '../../constants/index.js';
import { ParseResult, all, combine, ok } from '../../parsing/result.js';
import { isString } from '../../utils/guards.js';
import { RuleElement } from './ruleElement.js';

/**
 * The `pattern` rule (`{ kind: 'pattern', pattern: '^[a-z]+$' }`): a string
 * matches `pattern`, compiled in Unicode mode with the flags whose keys are
 * `true`: `insensitive` (`i`), `multiline` (`m`) and `dotall` (`s`).
 */
export class PatternRule extends RuleElement {
  readonly targets: readonly string[] = ['string'];

  protected readonly keys: readonly string[] = [
    ...RULE_KEYS,
    'pattern',
    ...Object.keys(PATTERN_FLAGS),
  ];

  private pattern: RegExp;

  /**
   * The names of the flags turned on (`['insensitive']`), shown in messages.
   */
  private flags: readonly string[] = [];

  /**
   * The kind of the rule, `pattern`.
   */
  get kind(): string {
    return 'pattern';
  }

  /**
   * Clones the rule with its own copy of the pattern (with its flags).
   * @param copy - the new, empty rule to fill
   */
  protected cloneExtra = (copy: PatternRule): void => {
    copy.pattern = this.pattern && new RegExp(this.pattern);
    copy.flags = this.flags;
  };

  /**
   * Checks that a string matches the pattern; a value that is not set passes.
   * The message names the flags turned on.
   * @param value - the converted value, `undefined` when not set
   */
  protected evaluate = (value: unknown): string | undefined => {
    if (value === undefined) return undefined;
    if (this.pattern.test(value as string)) return undefined;
    const flags = this.flags.length > 0 ? ` (${this.flags.join(', ')})` : '';
    return `must match the pattern ${this.pattern.source}${flags}`;
  };

  /**
   * Parses the required `pattern` and the optional flag keys, each a boolean,
   * and compiles the pattern in Unicode mode.
   * @param node - the rule node
   */
  protected parseExtra = (node: Record<string, unknown>): ParseResult<void> => {
    const names = Object.keys(PATTERN_FLAGS).filter((name) =>
      Object.hasOwn(node, name),
    );
    const flags = all(
      names.map((name) =>
        typeof node[name] === 'boolean'
          ? ok(node[name])
          : this.error(`${name} must be a boolean`, name),
      ),
    );
    const parsed = combine([
      this.parseKey(node, 'pattern', isString, 'a string'),
      flags,
    ]);
    if (!parsed.ok) return parsed;
    const [source, enabled] = parsed.value;
    this.flags = names.filter((_name, index) => enabled[index]);
    try {
      this.pattern = new RegExp(
        source,
        [...this.flags.map((name) => PATTERN_FLAGS[name]), UNICODE_FLAG].join(
          '',
        ),
      );
    } catch {
      return this.error('pattern is not a valid regular expression', 'pattern');
    }
    return ok(undefined);
  };
}
