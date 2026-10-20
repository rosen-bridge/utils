import {
  ParseResult,
  all,
  fail,
  ok,
  uniqueErrors,
} from '../../parsing/result.js';
import { isRecord } from '../../utils/guards.js';
import { SchemaElement } from '../schemaElement.js';
import { TypeElement } from '../types/typeElement.js';
import { DefinedRule } from './definedRule.js';

/**
 * The definitions of one kind (types or defined rules): their nodes by name,
 * and the result of parsing each, set when it is first needed and kept.
 */
class DefinitionTable<T extends SchemaElement> {
  /**
   * The node of each definition, by name.
   */
  nodes: ReadonlyMap<string, unknown> = new Map();

  /**
   * The result of parsing each definition parsed so far, by name.
   */
  readonly results = new Map<string, ParseResult<T>>();

  /**
   * Definitions being parsed, outermost first, to detect a definition that
   * refers to itself.
   */
  private readonly stack: string[] = [];

  /**
   * An empty table of definitions of one kind.
   * @param what - names a definition in messages (`type`, `rule`)
   * @param parseOne - parses the node of a definition by name
   */
  constructor(
    readonly what: 'type' | 'rule',
    private readonly parseOne: (node: unknown, name: string) => ParseResult<T>,
  ) {}

  /**
   * Parses the definition `name` unless it is parsed already or not defined.
   * @param name - the name of the definition
   */
  parse = (name: string): void => {
    if (this.results.has(name) || !this.nodes.has(name)) return;
    this.stack.push(name);
    const result = this.parseOne(this.nodes.get(name), name);
    this.stack.pop();
    this.results.set(name, result);
  };

  /**
   * The chain of definitions from `name` back to itself (`['a', 'b', 'a']`)
   * when `name` is being parsed, so using it now would be a loop.
   * @param name - the name of the definition
   */
  loop = (name: string): string[] | undefined => {
    const index = this.stack.indexOf(name);
    return index < 0 ? undefined : [...this.stack.slice(index), name];
  };
}

/**
 * The `definitions` of a schema document (`{ types?, rules? }`), used as
 * `{ type: 'ref', ref }` and `{ ref }`. Every definition is parsed, also
 * when unused, once it is first needed, so their order does not matter; a
 * definition that refers to itself is an error.
 */
export class DefinitionsElement extends SchemaElement {
  protected readonly keys: readonly string[] = ['types', 'rules'];

  private readonly types = new DefinitionTable<TypeElement>(
    'type',
    (node, name) => {
      const checked = this.checkName('type', name, 'types', name);
      return checked.ok
        ? this.scope.elements.parseType(
            node,
            this.scope,
            this.pointerOf('types', name),
            [],
          )
        : checked;
    },
  );

  private readonly rules = new DefinitionTable<DefinedRule>(
    'rule',
    (node, name) => this.parseDefinedRule(node, name),
  );

  /**
   * The kind of the element, `definitions`.
   */
  get kind(): string {
    return 'definitions';
  }

  /**
   * Clones the definition nodes and the valid parsed definitions; failed ones
   * are kept as they are.
   * @param copy - the new, empty definitions to fill
   */
  protected cloneMembers = (copy: DefinitionsElement): void => {
    this.cloneTable(this.types, copy.types, copy, 'types');
    this.cloneTable(this.rules, copy.rules, copy, 'rules');
  };

  /**
   * Copies `table` into `target`: the nodes, and each valid definition cloned
   * at its place below the copy.
   * @param table - the table to copy
   * @param target - the same table of `copy`
   * @param copy - the copy of the definitions
   * @param key - the member of the table (`types`, `rules`)
   */
  private cloneTable = <T extends SchemaElement>(
    table: DefinitionTable<T>,
    target: DefinitionTable<T>,
    copy: DefinitionsElement,
    key: 'types' | 'rules',
  ): void => {
    target.nodes = table.nodes;
    for (const [name, result] of table.results)
      target.results.set(
        name,
        result.ok
          ? ok(result.value.clone(copy.scope, copy.pointerOf(key, name)))
          : result,
      );
  };

  /**
   * The defined rule `name` parsed again for the kind `target`, or a failure
   * at `rules` when it is missing, has errors, loops or does not list `target`.
   * @param name - the name of the definition
   * @param target - the kind of the type the rule is used on
   */
  getRule = (name: string, target: string): ParseResult<DefinedRule> => {
    const definition = this.lookup(this.rules, name);
    if (!definition.ok) return definition;
    const { targets } = definition.value;
    if (!targets.includes(target))
      return this.error(
        `rule ${JSON.stringify(name)} cannot be applied to a ${JSON.stringify(target)} type (it is defined for ${targets.map((kind) => JSON.stringify(kind)).join(', ')})`,
        'rules',
      );
    return new DefinedRule(
      this.scope,
      this.pointerOf('rules', name),
      target,
      targets,
    ).parse(this.rules.nodes.get(name) as Record<string, unknown>);
  };

  /**
   * The type definition `name` parsed again at `location`, so its paths are
   * the use's, or a failure at `types`; the definition itself is parsed on
   * first use to find its problems once.
   * @param name - the name of the definition
   * @param location - the configuration path of the use
   */
  getType = (
    name: string,
    location: readonly string[],
  ): ParseResult<TypeElement> => {
    const definition = this.lookup(this.types, name);
    if (!definition.ok) return definition;
    return this.scope.elements.parseType(
      this.types.nodes.get(name),
      this.scope,
      this.pointerOf('types', name),
      location,
    );
  };

  /**
   * The definition `name` of `table`, parsed now if needed, or a failure when
   * there is none, it has errors or it refers to itself.
   * @param table - the definitions of one kind
   * @param name - the name of the definition
   */
  private lookup = <T extends SchemaElement>(
    table: DefinitionTable<T>,
    name: string,
  ): ParseResult<T> => {
    const shown = `${table.what} ${JSON.stringify(name)}`;
    const key = `${table.what}s`;
    const loop = table.loop(name);
    if (loop)
      return this.error(`${shown} refers to itself: ${loop.join(' -> ')}`, key);
    table.parse(name);
    const result = table.results.get(name);
    if (!result) return this.error(`${shown} is not defined`, key);
    if (!result.ok) return this.error(`${shown} has errors`, key);
    return result;
  };

  /**
   * Reads the optional `rules` and `types`, then parses every definition, and
   * reports the problems of all of them.
   * @param node - the `definitions` node
   */
  protected parseNode = (node: Record<string, unknown>): ParseResult<void> => {
    const rules = this.readEach(node.rules, 'rules');
    if (rules.ok) this.rules.nodes = rules.value;
    const types = this.readEach(node.types, 'types');
    if (types.ok) this.types.nodes = types.value;
    for (const name of this.rules.nodes.keys()) this.rules.parse(name);
    for (const name of this.types.nodes.keys()) this.types.parse(name);
    const errors = [
      rules,
      types,
      ...this.rules.results.values(),
      ...this.types.results.values(),
    ].flatMap((result) => (result.ok ? [] : result.errors));
    return errors.length > 0 ? fail(errors) : ok(undefined);
  };

  /**
   * Parses the defined rule `name` for each kind its required `type` lists,
   * reporting the problems found for any of them once; `getRule` parses it
   * again for the kind of each use.
   * @param node - the defined rule's node
   * @param name - the name of the defined rule
   */
  private parseDefinedRule = (
    node: unknown,
    name: string,
  ): ParseResult<DefinedRule> => {
    const checked = this.checkName('rule', name, 'rules', name);
    if (!checked.ok) return checked;
    if (!isRecord(node))
      return this.error('a defined rule must be an object', 'rules', name);
    if (!Object.hasOwn(node, 'type'))
      return this.error('missing required key "type"', 'rules', name);
    const targets = node.type;
    if (
      !Array.isArray(targets) ||
      targets.length === 0 ||
      !targets.every((target) => typeof target === 'string' && target !== '')
    )
      return this.error(
        'type must be a non-empty array of type kinds',
        'rules',
        name,
        'type',
      );
    const pointer = this.pointerOf('rules', name);
    const rules = all(
      targets.map((target) =>
        new DefinedRule(this.scope, pointer, target, targets).parse(node),
      ),
    );
    return rules.ok ? ok(rules.value[0]) : fail(uniqueErrors(rules.errors));
  };

  /**
   * The definition nodes of the `key` member (an object of definitions), by
   * name.
   * @param nodes - the value of the member
   * @param key - the member (`types`, `rules`)
   */
  private readEach = (
    nodes: unknown,
    key: 'types' | 'rules',
  ): ParseResult<Map<string, unknown>> => {
    if (nodes === undefined) return ok(new Map());
    if (!isRecord(nodes))
      return this.error(`${key} must be an object of definitions`, key);
    return ok(new Map(Object.entries(nodes)));
  };
}
