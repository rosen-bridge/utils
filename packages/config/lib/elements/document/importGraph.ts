import type { ParseResult } from '../../parsing/result.js';
import type { SchemaDocument } from './schemaDocument.js';

/**
 * The schema files a document and its imports read, shared by all of them:
 * each file is read and parsed once (`load`), and an import of a file that
 * is still being parsed (one of its own imports, directly or not) is a cycle
 * (`cycle`).
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
   * @param file - the absolute path of the root schema, if read from a file
   */
  constructor(file?: string) {
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
