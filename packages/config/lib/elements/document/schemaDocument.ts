import { createHash } from 'node:crypto';

import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';

import {
  ALPHANUMERIC_PATTERN,
  GENERATED_HEADER,
  HASH_ALGORITHM,
  HASH_CONSTANT,
  HASH_DOCUMENTATION,
  HASH_ROOT_NAME,
  ID_PATTERN,
  NAMESPACE_SEPARATOR,
} from '../../constants/index.js';
import {
  EnvironmentNames,
  EnvironmentTree,
} from '../../generators/environmentNames.js';
import { TypeNames } from '../../generators/typeNames.js';
import { createReading } from '../../parsing/reading.js';
import {
  ParseResult,
  SchemaError,
  combine,
  fail,
  ok,
  uniqueErrors,
} from '../../parsing/result.js';
import { quote, typeName } from '../../utils/format.js';
import { deepFreeze } from '../../utils/freeze.js';
import { isRecord } from '../../utils/guards.js';
import { BuiltinElements } from '../builtinElements.js';
import { ElementsMap } from '../elementsMap.js';
import { RuleElement } from '../rules/ruleElement.js';
import { SchemaElement } from '../schemaElement.js';
import { SchemaScope } from '../schemaScope.js';
import { TypeElement } from '../types/typeElement.js';
import { DefinitionsElement } from './definitionsElement.js';
import { ImportElement } from './importElement.js';
import { ImportGraph } from './importGraph.js';

/**
 * Where a document comes from: the absolute path of its `file` (relative
 * imports start from its directory; `undefined` for a schema not read from a
 * file), the `graph` of files read by the documents of the schema (a new one
 * for a root document), its `pointer` (`''` for the root document,
 * `[<file>]` for an imported one) and whether it is `imported` (only its
 * `imports` and `definitions` are parsed).
 */
export interface DocumentSource {
  readonly file?: string;
  readonly graph?: ImportGraph;
  readonly pointer?: string;
  readonly imported?: boolean;
}

/**
 * Where definitions are found by name: a document's own definitions, or an
 * imported document (which looks in its own definitions and imports).
 */
type Definitions = Pick<SchemaScope, 'getType' | 'getRule'>;

/**
 * The schema document `{ $schema?, id?, imports?, definitions?, schema }`,
 * the root element of a schema (pointer `''`, or `[<file>]` when imported):
 * `id` names it, `imports` and `definitions` hold what its types refer to,
 * and `schema` is the root type, not parsed in an imported document.
 */
export class SchemaDocument extends SchemaElement implements SchemaScope {
  /**
   * The definitions of the document: empty until `parse` reads the
   * `definitions` node into them, before the root type, so references in the
   * root type (and in the definitions themselves) can be resolved.
   */
  private definitions = new DefinitionsElement(
    this,
    this.pointerOf('definitions'),
  );

  private root?: TypeElement;

  private schemaId?: string;

  /**
   * The imports of the document that were read without problems, by name.
   */
  private imports: ReadonlyMap<string, ImportElement> = new Map();

  /**
   * The names of the imports that have problems, so a reference to them says
   * so instead of naming an unknown import.
   */
  private failedImports: ReadonlySet<string> = new Set();

  private readonly file?: string;

  private readonly graph: ImportGraph;

  private readonly imported: boolean;

  protected readonly keys: readonly string[] = [
    '$schema',
    'id',
    'imports',
    'definitions',
    'schema',
  ];

  /**
   * The kind of the element, `document`.
   */
  get kind(): string {
    return 'document';
  }

  /**
   * The `id` of the schema, once parsed, or `undefined` when it has none.
   */
  get id(): string | undefined {
    return this.schemaId;
  }

  /**
   * An empty document, the scope of all its elements and its own.
   * @param elements - the element classes the schema can use
   * @param logger - receives the logs of the document (none by default)
   * @param source - where the document comes from
   */
  constructor(
    readonly elements: ElementsMap,
    readonly logger: AbstractLogger = new DummyLogger(),
    source: DocumentSource = {},
  ) {
    super(undefined, source.pointer ?? '');
    this.file = source.file;
    this.graph = source.graph ?? new ImportGraph(source.file);
    this.imported = source.imported ?? false;
  }

  /**
   * A root document with the built-in element classes.
   * @param logger - receives the logs of the document (none by default)
   * @param file - the absolute path of the schema file, if read from one
   */
  static initialize = (
    logger?: AbstractLogger,
    file?: string,
  ): SchemaDocument => {
    return new SchemaDocument(new BuiltinElements(), logger, { file });
  };

  /**
   * A new, empty document with the same element classes, logger and source;
   * a document is its own scope, so `clone`'s scope and pointer are not used.
   */
  protected create = (): this => {
    return new SchemaDocument(this.elements, this.logger, {
      file: this.file,
      graph: this.graph,
      pointer: this.pointer,
      imported: this.imported,
    }) as this;
  };

  /**
   * Clones the document with its definitions, root type and imports.
   * @param copy - the new, empty document to fill
   */
  protected cloneMembers = (copy: SchemaDocument): void => {
    copy.definitions = this.definitions.clone(
      copy,
      copy.pointerOf('definitions'),
    );
    copy.root = this.root?.clone(copy, copy.pointerOf('schema'));
    copy.schemaId = this.schemaId;
    copy.imports = new Map(
      [...this.imports].map(([name, element]) => [
        name,
        element.clone(copy, element.pointer),
      ]),
    );
    copy.failedImports = this.failedImports;
  };

  /**
   * A copy of the default configuration, the value of an empty configuration
   * read with this document, or `undefined`. Throws when the document is not
   * parsed or has no `schema`.
   */
  defaultValue = (): unknown => {
    if (this.root === undefined)
      throw new Error('the schema document is not parsed or has no schema');
    this.logger.debug('building the default configuration');
    return structuredClone(this.root.defaultValue());
  };

  /**
   * The content of the `custom-environment-variables` file: keys mapped to
   * variables named after their path in UPPER_SNAKE_CASE. Throws when the
   * document is not parsed or has no `schema`.
   * @param all - whether every value gets a variable, not only secret ones
   * @param prefix - the prefix of every variable name
   */
  environment = (all = false, prefix = ''): EnvironmentTree => {
    if (this.root === undefined)
      throw new Error('the schema document is not parsed or has no schema');
    this.logger.debug(
      `generating the environment variables of ${all ? 'every value' : 'the secret values'}`,
    );
    const tree = this.root.environment(
      [],
      new EnvironmentNames(all, prefix, this.logger),
    );
    return typeof tree === 'object' ? tree : {};
  };

  /**
   * The TypeScript source of the types of a configuration read with this
   * document: `SCHEMA_HASH`, then the declarations of the root type. Throws
   * when the document is not parsed or has no `schema`.
   * @param rootName - the name of the root type (default: from the `id`)
   */
  generateTypes = (
    rootName = this.schemaId !== undefined &&
    ALPHANUMERIC_PATTERN.test(this.schemaId)
      ? typeName(this.schemaId)
      : 'Config',
  ): string => {
    this.logger.debug(
      `generating the types of the configuration as ${rootName}`,
    );
    const declarations = this.declarations(rootName);
    this.logger.info(
      `generated ${declarations.length} type declarations for the configuration`,
    );
    const hash = `${HASH_DOCUMENTATION}\nexport const ${HASH_CONSTANT} = ${quote(this.hash())};`;
    return `${[GENERATED_HEADER, hash, ...declarations].join('\n\n')}\n`;
  };

  /**
   * The TypeScript declarations of the root type, each written once, from two
   * passes (the first collects the names). Throws when there is no `schema`.
   * @param rootName - the name of the root type
   */
  private declarations = (rootName: string): string[] => {
    if (this.root === undefined)
      throw new Error('the schema document is not parsed or has no schema');
    const names = new TypeNames();
    this.root.code([rootName], names);
    names.finish();
    return [...new Set(this.root.code([rootName], names).codes)];
  };

  /**
   * The hash of the schema (`sha256:3f1c…`), of the declarations of its types
   * with the root named `HASH_ROOT_NAME`, so it changes with the types. Throws
   * when the document is not parsed or has no `schema`.
   */
  hash = (): string => {
    const text = this.declarations(HASH_ROOT_NAME).join('\n\n');
    const digest = createHash(HASH_ALGORITHM).update(text).digest('hex');
    return `${HASH_ALGORITHM}:${digest}`;
  };

  /**
   * The rule defined as `name`, parsed for a type of kind `target`: in the
   * document's own definitions, or for `<as>.<name>` in the import `<as>`.
   * @param name - the name of the definition
   * @param target - the kind of the type the rule is used on
   */
  getRule = (name: string, target: string): ParseResult<RuleElement> =>
    this.find(name, (definitions, rest) => definitions.getRule(rest, target));

  /**
   * The type defined as `name`, parsed at `location`: in the document's own
   * definitions, or for `<as>.<name>` in the document of the import `<as>`.
   * @param name - the name of the definition
   * @param location - the configuration path of the use
   */
  getType = (
    name: string,
    location: readonly string[],
  ): ParseResult<TypeElement> =>
    this.find(name, (definitions, rest) => definitions.getType(rest, location));

  /**
   * The definition `name` found with `resolve` in the document's own
   * definitions, or for a dotted name in the import named before the first
   * dot; fails at `imports` when that import is missing or has problems.
   * @param name - the name of the definition
   * @param resolve - finds the rest of the name in definitions
   */
  private find = <T>(
    name: string,
    resolve: (definitions: Definitions, rest: string) => ParseResult<T>,
  ): ParseResult<T> => {
    if (!name.includes(NAMESPACE_SEPARATOR))
      return resolve(this.definitions, name);
    const [prefix, ...parts] = name.split(NAMESPACE_SEPARATOR);
    const imported = this.imports.get(prefix);
    if (imported === undefined)
      return this.error(
        this.failedImports.has(prefix)
          ? `the import ${JSON.stringify(prefix)} has errors`
          : `no import is named ${JSON.stringify(prefix)}`,
        'imports',
      );
    const result = resolve(imported.document, parts.join(NAMESPACE_SEPARATOR));
    return result.ok
      ? result
      : fail(
          result.errors.map(({ path, message }) => ({
            path,
            message: `${message} in the import ${JSON.stringify(prefix)}`,
          })),
        );
  };

  /**
   * Parses `$schema`, `id`, `imports`, `definitions` and the root type, then
   * resolves every condition of the root type once the whole schema is valid;
   * repeated problems are reported once.
   * @param node - the schema document node
   */
  protected parseNode = (node: Record<string, unknown>): ParseResult<void> => {
    this.logger.debug(
      this.imported
        ? `parsing the imported schema ${this.pointer}`
        : 'parsing the schema document',
    );
    const id = this.parseId(node.id);
    const imports = this.parseImports(node.imports);
    const definitions = this.parseDefinitions(node.definitions);
    const result = combine([
      node.$schema === undefined || typeof node.$schema === 'string'
        ? ok(undefined)
        : this.error('$schema must be a string', '$schema'),
      id,
      imports,
      definitions,
      !this.imported && Object.hasOwn(node, 'schema')
        ? this.scope.elements.parseType(
            node.schema,
            this,
            this.pointerOf('schema'),
            [],
          )
        : ok(undefined),
    ]);
    if (!result.ok) return result;
    this.schemaId = result.value[1];
    this.root = result.value[4];
    if (this.root === undefined) {
      this.logger.debug('the schema document has no schema');
      return ok(undefined);
    }
    this.logger.debug('resolving the conditions of the schema');
    const resolved = this.root.resolve(this.root);
    return resolved.ok ? ok(undefined) : fail(uniqueErrors(resolved.errors));
  };

  /**
   * Parses the `definitions` into the document's own definitions, so
   * `getType` and `getRule` reach them while they are parsed.
   * @param node - the `definitions` of the document
   */
  private parseDefinitions = (
    node: unknown,
  ): ParseResult<DefinitionsElement> => {
    if (node !== undefined && !isRecord(node))
      return this.error('definitions must be an object', 'definitions');
    return this.definitions.parse(node ?? {});
  };

  /**
   * The optional `id` of the schema: ASCII letters, digits, `-` and `_`.
   * @param node - the `id` of the document
   */
  private parseId = (node: unknown): ParseResult<string | undefined> => {
    if (node === undefined) return ok(undefined);
    return typeof node === 'string' && ID_PATTERN.test(node)
      ? ok(node)
      : this.error(
          'id must be a non-empty string of letters, digits, "-" and "_"',
          'id',
        );
  };

  /**
   * Parses the optional `imports`, imports with distinct names; those read
   * without problems are kept, and the names of the others too.
   * @param node - the `imports` of the document
   */
  private parseImports = (node: unknown): ParseResult<void> => {
    if (node === undefined) return ok(undefined);
    if (!Array.isArray(node))
      return this.error('imports must be a list of imports', 'imports');
    const imports = new Map<string, ImportElement>();
    const failed = new Set<string>();
    const errors = node.flatMap((item, index) => {
      if (!isRecord(item))
        return [this.problem('an import must be an object', 'imports', index)];
      const name = item.as;
      if (typeof name === 'string' && (imports.has(name) || failed.has(name)))
        return [
          this.problem(
            `the name ${JSON.stringify(name)} is already imported`,
            'imports',
            index,
            'as',
          ),
        ];
      const parsed = new ImportElement(
        this,
        this.pointerOf('imports', index),
        this.file,
        this.graph,
      ).parse(item);
      if (parsed.ok) imports.set(parsed.value.name, parsed.value);
      else if (typeof name === 'string') failed.add(name);
      return parsed.ok ? [] : parsed.errors;
    });
    this.imports = imports;
    this.failedImports = failed;
    return errors.length > 0 ? fail(errors) : ok(undefined);
  };

  /**
   * Reads `config` with this document: the read configuration, deeply frozen,
   * or every problem at its dotted path; conditional rules are checked once
   * the whole value is read. Throws when there is no `schema`.
   * @param config - a configuration object
   * @param expectedHash - the `SCHEMA_HASH` the schema must still have
   */
  validate = <T = unknown>(
    config: unknown,
    expectedHash?: string,
  ): ParseResult<T> => {
    if (this.root === undefined)
      throw new Error('the schema document is not parsed or has no schema');
    if (expectedHash !== undefined && expectedHash !== this.hash()) {
      const message =
        'the schema changed since its types were generated: generate them again';
      this.logger.error(message, { expectedHash, hash: this.hash() });
      return fail([{ path: '', message }]);
    }
    const reading = createReading('', config);
    const read = this.root.normalize(config, '', reading);
    if (!read.ok) return this.invalid(read.errors);
    this.logger.debug(
      `checking ${reading.deferred.length} conditional rules of the configuration`,
    );
    const errors = reading.deferred.flatMap((check) => check(read.value));
    if (errors.length > 0) return this.invalid(errors);
    this.logger.info('the configuration is valid');
    return ok(deepFreeze(read.value) as T);
  };

  /**
   * Logs the problems found in the configuration and fails with them.
   * @param errors - the problems found
   */
  private invalid = (errors: readonly SchemaError[]): ParseResult<never> => {
    this.logger.warn(`the configuration has ${errors.length} problems`, {
      errors,
    });
    return fail(errors);
  };
}
