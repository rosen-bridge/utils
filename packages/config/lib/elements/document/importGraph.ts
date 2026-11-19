import type { ParseResult } from '../../parsing/result';
import type { SchemaDocument } from './schemaDocument';

/**
 * Creates a document, with the arguments of the `SchemaDocument`
 * constructor; given to the graph by `SchemaDocument`, so imports create the
 * documents they read without importing `SchemaDocument` themselves.
 */
export type DocumentFactory = (
  ...args: ConstructorParameters<typeof SchemaDocument>
) => SchemaDocument;

/**
 * The schema files read by a document and its imports, shared by all: each is
 * parsed once (`load`), importing one still being parsed is a cycle (`cycle`),
 * and imported documents are created with `createDocument`.
 */
export class ImportGraph {
  /**
   * The parsed document of each file read, by absolute path.
   */
  private readonly documents = new Map<string, ParseResult<SchemaDocument>>();

  /**
   * The files being parsed, the root first.
   */
  private readonly stack: string[];

  /**
   * A graph whose root is the schema read from `file`.
   * @param createDocument - creates the document of an imported file
   * @param file - the absolute path of the root schema, if read from a file
   */
  constructor(
    readonly createDocument: DocumentFactory,
    file?: string,
  ) {
    this.stack = file === undefined ? [] : [file];
  }

  /**
   * The chain of files from `file` back to itself when `file` is being
   * parsed, so importing it now is a cycle.
   * @param file - the absolute path of the imported file
   */
  cycle = (file: string): string[] | undefined => {
    const index = this.stack.indexOf(file);
    return index < 0 ? undefined : [...this.stack.slice(index), file];
  };

  /**
   * The document of `file`: parsed with `parse` the first time, the same
   * result afterwards.
   * @param file - the absolute path of the file
   * @param parse - reads and parses the file
   */
  load = (
    file: string,
    parse: () => ParseResult<SchemaDocument>,
  ): ParseResult<SchemaDocument> => {
    const loaded = this.documents.get(file);
    if (loaded !== undefined) return loaded;
    this.stack.push(file);
    const result = parse();
    this.stack.pop();
    this.documents.set(file, result);
    return result;
  };
}
