import { MAX_MESSAGE_LENGTH, RULE_KEYS } from '../../constants/index.js';
import { ParseResult, combine, ok } from '../../parsing/result.js';
import { ConditionElement } from '../conditions/conditionElement.js';
import type { RuleClass } from '../elementsMap.js';
import { CloneHook, SchemaElement } from '../schemaElement.js';
import type { SchemaScope } from '../schemaScope.js';
import type { TypeElement } from '../types/typeElement.js';

/**
 * Base of every rule of a schema (`minLength`, `pattern`, ...). A rule may
 * have a `when` condition unless its class says otherwise in its
 * constructor (`allowsWhen`), and may have a `message` that replaces the
 * message of its evaluation when a value fails it.
 */
export abstract class RuleElement extends SchemaElement {
  /**
   * Kinds of the types the rule applies to.
   */
  abstract readonly targets: readonly string[];

  protected when?: ConditionElement;

  /**
   * The custom message of the rule, which replaces the message of
   * `evaluate` when a value fails the rule.
   */
  protected message?: string;

  /**
   * Keys of the rule's node, without `message` and `when` (added to the
   * accepted keys: `when` only when the rule allows it). A subclass adds the
   * keys of its own parameters (`[...RULE_KEYS, 'bound']`).
   */
  protected readonly keys: readonly string[] = RULE_KEYS;

  /**
   * The rule's keys with `message`, and with `when` when the rule allows it.
   */
  protected get acceptedKeys(): readonly string[] {
    return this.allowsWhen
      ? [...this.keys, 'message', 'when']
      : [...this.keys, 'message'];
  }

  /**
   * A rule for types of kind `target`, which may have a `when` when
   * `allowsWhen` is set (rules of a type may, those of a defined rule may not).
   * @param scope - the document of the rule
   * @param pointer - the pointer of the rule's node
   * @param target - the kind of the type the rule is for
   * @param allowsWhen - whether the rule's node may have a `when`
   */
  constructor(
    scope: SchemaScope,
    pointer: string,
    readonly target: string,
    readonly allowsWhen = false,
  ) {
    super(scope, pointer);
  }

  /**
   * Whether the rule applies to a value of a read configuration: it has no
   * `when`, or its `when` holds.
   * @param config - the read configuration
   * @param at - the configuration path of the value, with real indexes
   */
  applies(config: unknown, at: readonly string[]): boolean {
    return this.when === undefined || this.when.evaluate(config, at);
  }

  /**
   * Whether the rule has a `when`.
   */
  conditional = () => this.when !== undefined;

  /**
   * A new, empty rule of this class, for `clone`, for the same target and
   * allowing a `when` exactly when this rule does.
   * @param scope - the document of the new rule
   * @param pointer - the pointer of the new rule
   */
  protected create = (scope: SchemaScope, pointer: string): this => {
    const element = this.constructor as RuleClass<this>;
    return new element(scope, pointer, this.target, this.allowsWhen);
  };

  /**
   * Clones the `when` condition and the `message` of the rule, then the
   * members of the subclass with `cloneExtra`.
   * @param copy - the new, empty rule to fill
   */
  protected cloneMembers = (copy: RuleElement): void => {
    copy.when = this.when?.clone(copy.scope, copy.pointerOf('when'));
    copy.message = this.message;
    this.cloneExtra(copy);
  };

  /**
   * Copies the parsed members of the subclass's rule into `copy`.
   * @param copy - the new, empty rule to fill
   */
  protected abstract cloneExtra: CloneHook<RuleElement>;

  /**
   * Parses the optional `when` and `message`, then the members of the subclass
   * with `parseExtra`, and reports the problems of all of them.
   * @param node - the rule node
   */
  protected parseNode = (node: Record<string, unknown>): ParseResult<void> => {
    const when =
      this.allowsWhen && Object.hasOwn(node, 'when')
        ? this.scope.elements.parseCondition(
            node.when,
            this.scope,
            this.pointerOf('when'),
          )
        : ok(undefined);
    if (when.ok) this.when = when.value;
    const message = this.parseMessage(node);
    if (message.ok) this.message = message.value;
    const result = combine([when, message, this.parseExtra(node)]);
    return result.ok ? ok(undefined) : result;
  };

  /**
   * Parses the members of the subclass's rule node (its parameters, the `ref`
   * of a reference), for a type of kind `target`.
   * @param node - the rule node
   */
  protected abstract parseExtra: (
    node: Record<string, unknown>,
  ) => ParseResult<void>;

  /**
   * The required `key` of the node (a parameter such as the `bound` of `min`),
   * which must pass `isValid`.
   * @param node - the rule node
   * @param key - the key of the parameter
   * @param isValid - checks the value of the parameter
   * @param expected - describes a valid value in the message
   */
  protected parseKey = <T>(
    node: Record<string, unknown>,
    key: string,
    isValid: (value: unknown) => value is T,
    expected: string,
  ): ParseResult<T> => {
    if (!Object.hasOwn(node, key))
      return this.error(`missing required key ${JSON.stringify(key)}`);
    return isValid(node[key])
      ? ok(node[key])
      : this.error(`${key} must be ${expected}`, key);
  };

  /**
   * The optional `message` of the node, a non-empty string of at most
   * `MAX_MESSAGE_LENGTH` characters.
   * @param node - the rule node
   */
  private parseMessage = (
    node: Record<string, unknown>,
  ): ParseResult<string | undefined> => {
    if (!Object.hasOwn(node, 'message')) return ok(undefined);
    if (typeof node.message !== 'string' || node.message === '')
      return this.error('message must be a non-empty string', 'message');
    return node.message.length <= MAX_MESSAGE_LENGTH
      ? ok(node.message)
      : this.error(
          `message must have at most ${MAX_MESSAGE_LENGTH} characters`,
          'message',
        );
  };

  /**
   * Resolves the rule's `when`, if any, against the root type. A defined rule
   * and its rules have none (a `{ ref, when }` resolves its own).
   * @param root - the parsed root type
   * @param at - the configuration path of the node that has the rule
   */
  resolve = (root: TypeElement, at: readonly string[]): ParseResult<void> => {
    return this.when?.resolve(root, at) ?? ok(undefined);
  };

  /**
   * Checks a value with `evaluate`: when it fails, returns the rule's
   * `message` if it has one, or else the message of `evaluate`.
   * @param value - the converted value, `undefined` when not set
   */
  validate = (value: unknown): string | undefined => {
    const failure = this.evaluate(value);
    return failure === undefined ? undefined : (this.message ?? failure);
  };

  /**
   * What a value fails (`"must be at least 1"`, never the value itself), or
   * `undefined` when it passes. Throws when the rule is not parsed.
   * @param value - the converted value, `undefined` when not set
   */
  protected abstract evaluate: (value: unknown) => string | undefined;

  /**
   * Whether the rule makes the value always set, whatever the configuration
   * (an unconditional `required`). Most rules do not.
   */
  requires = (): boolean => false;

  /**
   * The values the rule limits a value to, whatever the configuration (an
   * unconditional `enum`), or `undefined` when it does not.
   */
  allowedValues = (): readonly unknown[] | undefined => undefined;
}
