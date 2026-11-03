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
} from '../../constants/index';
import {
  EnvironmentNames,
  EnvironmentTree,
} from '../../generators/environmentNames';
import { TypeNames } from '../../generators/typeNames';
import { createReading } from '../../parsing/reading';
import {
  ParseResult,
  SchemaError,
  combine,
  fail,
  ok,
  uniqueErrors,
} from '../../parsing/result';
import { quote, typeName } from '../../utils/format';
import { deepFreeze } from '../../utils/freeze';
import { isRecord } from '../../utils/guards';
import { BuiltinElements } from '../builtinElements';
import { ElementsMap } from '../elementsMap';
import { RuleElement } from '../rules/ruleElement';
import { SchemaElement } from '../schemaElement';
import { SchemaScope } from '../schemaScope';
import { TypeElement } from '../types/typeElement';
import { DefinitionsElement } from './definitionsElement';

/**
 * Where a document comes from, given to the `SchemaDocument` constructor.
 */
export interface DocumentSource {
  /**
   * The absolute path of its file, where relative imports start (`undefined`
   * for a schema not read from a file).
   */
  readonly file?: string;
}

/**
 * The schema document `{ $schema?, id?, definitions?, schema }`, the root
 * element (pointer `''`). `schema` is the root type.
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

  private readonly file?: string;

  protected readonly keys: readonly string[] = [
    '$schema',
    'id',
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
    super(undefined, '');
    this.file = source.file;
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
    }) as this;
  };

  /**
   * Clones the document with its definitions and root type.
   * @param copy - the new, empty document to fill
   */
  protected cloneMembers = (copy: SchemaDocument): void => {
    copy.definitions = this.definitions.clone(
      copy,
      copy.pointerOf('definitions'),
    );
    copy.root = this.root?.clone(copy, copy.pointerOf('schema'));
    copy.schemaId = this.schemaId;
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
   * The rule defined as `name` in the document's definitions, parsed for a
   * type of kind `target`.
   * @param name - the name of the definition
   * @param target - the kind of the type the rule is used on
   */
  getRule = (name: string, target: string): ParseResult<RuleElement> =>
    this.definitions.getRule(name, target);

  /**
   * The type defined as `name` in the document's definitions, parsed at
   * `location`.
   * @param name - the name of the definition
   * @param location - the configuration path of the use
   */
  getType = (
    name: string,
    location: readonly string[],
  ): ParseResult<TypeElement> => this.definitions.getType(name, location);

  /**
   * Parses `$schema`, `id`, `definitions` and the root type, then
   * resolves every condition of the root type once the whole schema is valid;
   * repeated problems are reported once.
   * @param node - the schema document node
   */
  protected parseNode = (node: Record<string, unknown>): ParseResult<void> => {
    this.logger.debug('parsing the schema document');
    const id = this.parseId(node.id);
    const definitions = this.parseDefinitions(node.definitions);
    const result = combine([
      node.$schema === undefined || typeof node.$schema === 'string'
        ? ok(undefined)
        : this.error('$schema must be a string', '$schema'),
      id,
      definitions,
      Object.hasOwn(node, 'schema')
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
    this.root = result.value[3];
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
