import { existsSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, isAbsolute, relative, resolve } from 'node:path';

import {
  IMPORT_NAME_PATTERN,
  RELATIVE_IMPORT_PREFIXES,
  URL_SCHEME_PATTERN,
} from '../../constants/index.js';
import { ParseResult, combine, fail, ok } from '../../parsing/result.js';
import { isRecord } from '../../utils/guards.js';
import { readSchemaFile } from '../../utils/schemaFile.js';
import { SchemaElement } from '../schemaElement.js';
import type { SchemaScope } from '../schemaScope.js';
import { ImportGraph } from './importGraph.js';
import { SchemaDocument } from './schemaDocument.js';

/**
 * An import of a schema document (`{ from, as }`): the file `from`, relative
 * to the importing schema or in an installed package, whose definitions are
 * referred to as `<as>.<name>`. Only its `imports` and `definitions` are
 * parsed. It is created by its `SchemaDocument`.
 */
export class ImportElement extends SchemaElement {
  protected readonly keys: readonly string[] = ['from', 'as'];

  /**
   * The name the importing document refers to the import by (`common`).
   */
  private importName: string;

  private importedDocument: SchemaDocument;

  /**
   * The kind of the element, `import`.
   */
  get kind(): string {
    return 'import';
  }

  /**
   * The name the importing document refers to the import by.
   */
  get name(): string {
    return this.importName;
  }

  /**
   * The imported document, parsed for its `imports` and `definitions`.
   */
  get document(): SchemaDocument {
    return this.importedDocument;
  }

  /**
   * An empty import of the importing schema file `file`.
   * @param scope - the importing document
   * @param pointer - the pointer of the import's node
   * @param file - the importing file (`undefined`: the schema cannot import)
   * @param graph - the files read by the documents of the schema
   */
  constructor(
    scope: SchemaScope,
    pointer: string,
    readonly file: string | undefined,
    readonly graph: ImportGraph,
  ) {
    super(scope, pointer);
  }

  /**
   * A new, empty import, for `clone`, of the same importing file.
   * @param scope - the document of the new import
   * @param pointer - the pointer of the new import
   */
  protected create = (scope: SchemaScope, pointer: string): this => {
    return new ImportElement(scope, pointer, this.file, this.graph) as this;
  };

  /**
   * Clones the import; the imported document is shared, as parsed elements
   * never change.
   * @param copy - the new, empty import to fill
   */
  protected cloneMembers = (copy: ImportElement): void => {
    copy.importName = this.importName;
    copy.importedDocument = this.importedDocument;
  };

  /**
   * The document of the file `from` names, read once for the whole schema and
   * parsed for its `imports` and `definitions` only; a cycle is a problem.
   * @param from - the `from` of the import
   */
  private importFile = (from: string): ParseResult<SchemaDocument> => {
    const located = this.locate(from);
    if (!located.ok) return located;
    const file = located.value;
    const cycle = this.graph.cycle(file);
    if (cycle !== undefined)
      return this.error(
        `imports form a cycle: ${cycle.map((item) => relative(process.cwd(), item)).join(' -> ')}`,
        'from',
      );
    return this.graph.load(file, () => {
      const read = readSchemaFile(file, this.scope.logger);
      if (!read.ok)
        return fail(
          read.errors.map(({ message }) => this.problem(message, 'from')),
        );
      if (!isRecord(read.value))
        return this.error(
          `${JSON.stringify(from)} must contain a schema document (an object)`,
          'from',
        );
      return new SchemaDocument(this.scope.elements, this.scope.logger, {
        file,
        graph: this.graph,
        pointer: `[${relative(process.cwd(), file)}]`,
        imported: true,
      }).parse(read.value);
    });
  };

  /**
   * The absolute path of the file `from` names: relative to the importing
   * file's directory, or a file of an installed package; URLs, absolute paths
   * and missing files are problems at `from`.
   * @param from - the `from` of the import
   */
  private locate = (from: string): ParseResult<string> => {
    const shown = JSON.stringify(from);
    if (URL_SCHEME_PATTERN.test(from))
      return this.error(
        `${shown} is a URL: only relative paths and installed packages can be imported`,
        'from',
      );
    if (isAbsolute(from))
      return this.error(
        `${shown} is an absolute path: only relative paths and installed packages can be imported`,
        'from',
      );
    if (this.file === undefined)
      return this.error(
        `${shown} cannot be imported: the importing schema was not read from a file`,
        'from',
      );
    let file: string;
    if (RELATIVE_IMPORT_PREFIXES.some((prefix) => from.startsWith(prefix))) {
      file = resolve(dirname(this.file), from);
    } else {
      try {
        file = createRequire(this.file).resolve(from);
      } catch {
        return this.error(
          `${shown} is not found in the installed packages`,
          'from',
        );
      }
    }
    return existsSync(file) && statSync(file).isFile()
      ? ok(file)
      : this.error(`${shown} does not exist (${file})`, 'from');
  };

  /**
   * Parses the required `as` (a letter, then letters, digits, `-` and `_`)
   * and `from`, then reads and parses the imported file (`importFile`).
   * @param node - the import node
   */
  protected parseNode = (node: Record<string, unknown>): ParseResult<void> => {
    const keys = combine([
      typeof node.as === 'string' && IMPORT_NAME_PATTERN.test(node.as)
        ? ok(node.as)
        : this.error(
            'as must be a letter, then letters, digits, "-" and "_"',
            'as',
          ),
      typeof node.from === 'string' && node.from !== ''
        ? ok(node.from)
        : this.error('from must be a non-empty string', 'from'),
    ]);
    if (!keys.ok) return keys;
    const [name, from] = keys.value;
    const document = this.importFile(from);
    if (!document.ok) return document;
    this.importName = name;
    this.importedDocument = document.value;
    return ok(undefined);
  };
}
