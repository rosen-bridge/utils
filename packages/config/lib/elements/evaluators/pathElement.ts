import {
  ANY_INDEX,
  ANY_INDEX_SHOWN,
  INDEX_PATTERN,
  LEADING_DOTS_PATTERN,
  PATH_SEPARATOR,
} from '../../constants/index.js';
import { createReading } from '../../parsing/reading.js';
import { ParseResult, ok } from '../../parsing/result.js';
import { isRecord } from '../../utils/guards.js';
import { expand, step, unwrap } from '../../utils/typeTree.js';
import { LiteralElement } from '../types/literalElement.js';
import { ScalarElement } from '../types/scalar/scalarElement.js';
import { TypeElement } from '../types/typeElement.js';
import { EvaluatorElement, Lookup } from './evaluatorElement.js';

/**
 * The type a value of `type` is compared as: the scalar type of the value of
 * a `literal` (`string` for `'postgres'`), or the type itself.
 * @param type - the type at a path
 */
const comparedAs = (type: TypeElement): TypeElement =>
  type instanceof LiteralElement ? type.scalarType : type;

/**
 * The value at a `path` of the configuration (`{ path: 'server.port' }`):
 * dot-separated names from the root or, after leading dots, relative to the
 * node whose rule has it (one dot is its parent, each further dot one level
 * up). Through a union it goes into the options that have its next segment.
 */
export class PathElement extends EvaluatorElement {
  protected readonly keys: readonly string[] = ['path'];

  /**
   * The names after the leading dots.
   */
  private path: readonly string[];

  /**
   * The number of leading dots: 0 for a path from the configuration root.
   */
  private up = 0;

  /**
   * The full path found by `resolve`, shown in messages.
   */
  private resolvedPath: readonly string[] = [];

  /**
   * The types at the path, once resolved: one, or one for each union option
   * the path goes through that has it.
   */
  private resolved: readonly TypeElement[] = [];

  /**
   * The type of each node along the path, once resolved: the root type, then
   * the type at each segment (the first, when the path goes through a
   * union), for the defaults of nodes the configuration does not have.
   */
  private chain: readonly TypeElement[] = [];

  /**
   * The kind of the evaluator, `path`, its only key.
   */
  get kind(): string {
    return 'path';
  }

  /**
   * The type at the path once resolved (the first, when the path goes through
   * a union), as it is compared (the scalar type of a `literal`).
   */
  get type(): TypeElement | undefined {
    return this.resolved[0] && comparedAs(this.resolved[0]);
  }

  /**
   * The configuration path as written (`server.port`, `..mode`).
   */
  get pathText(): string {
    return PATH_SEPARATOR.repeat(this.up) + this.path.join(PATH_SEPARATOR);
  }

  /**
   * Checks that the types at the path are compared as scalars of one kind,
   * the kind of `type`.
   * @param type - the type the path is compared with
   */
  bind = (type: TypeElement): ParseResult<void> => {
    const shown = this.describe(this.resolvedPath);
    const compared = this.resolved.map(comparedAs);
    if (!compared.every((found) => found instanceof ScalarElement))
      return this.error(
        `${shown} must be a string, number, bigint, boolean or literal to be compared`,
        'path',
      );
    const kinds = [...new Set(compared.map((found) => found.kind))];
    if (kinds.length > 1)
      return this.error(
        `${shown} must have one type in the union options to be compared, not ${kinds.join(' and ')}`,
        'path',
      );
    if (kinds[0] !== type.kind)
      return this.error(
        `${shown} is a ${kinds[0]}, not a ${type.kind}`,
        'path',
      );
    return ok(undefined);
  };

  /**
   * Clones the path and, once resolved, the types along it (shared); a clone
   * made before `resolve` stays unresolved.
   * @param copy - the new, empty evaluator to fill
   */
  protected cloneMembers = (copy: PathElement): void => {
    copy.path = this.path;
    copy.up = this.up;
    copy.resolvedPath = this.resolvedPath;
    copy.resolved = this.resolved;
    copy.chain = this.chain;
  };

  /**
   * The value at the path of a configuration, converted with the type it is
   * compared as; below a node the configuration does not have, the value
   * comes from that node's default (`fallback`).
   * @param config - the configuration (being read, or read)
   * @param at - the configuration path of the value, with real indexes
   */
  evaluate(config: unknown, at: readonly string[]): Lookup {
    if (this.resolved.length === 0)
      throw new Error(
        `${this.constructor.name} at ${JSON.stringify(this.pointer)} is not resolved; process the whole schema first`,
      );
    const path = this.fullPath(at);
    if (path === undefined) return { present: false };
    let value = config;
    for (const [index, segment] of path.entries()) {
      if (value === undefined || value === null)
        return this.fallback(path, index);
      if (!this.has(value, segment)) return { present: false };
      value = (value as Record<string, unknown>)[segment];
    }
    if (value === undefined) return this.fallback(path, path.length);
    const read = (
      comparedAs(this.resolved[0]) as ScalarElement<unknown>
    ).transform(value, '', createReading());
    return read.ok ? { present: true, value: read.value } : { present: false };
  }

  /**
   * Whether `segment` can be read from `value`: an index of an array within
   * its length, or any key of an object.
   * @param value - the value to read from
   * @param segment - the key or index to read
   */
  private has = (value: unknown, segment: string): boolean => {
    return Array.isArray(value)
      ? INDEX_PATTERN.test(segment) && Number(segment) < value.length
      : isRecord(value);
  };

  /**
   * The value at `path` when the configuration has no node after its first
   * `depth` segments: the default of that node's type, followed along the rest.
   * @param path - the full configuration path
   * @param depth - the number of segments the configuration has
   */
  private fallback = (path: readonly string[], depth: number): Lookup => {
    let value = this.chain[depth].defaultValue();
    for (const segment of path.slice(depth)) {
      if (!this.has(value, segment)) return { present: false };
      value = (value as Record<string, unknown>)[segment];
    }
    return value === undefined ? { present: false } : { present: true, value };
  };

  /**
   * Parses the required `path`: leading dots, then dot-separated names (none
   * only after a dot).
   * @param node - the evaluator node
   */
  protected parseNode = (node: Record<string, unknown>): ParseResult<void> => {
    const text = node.path;
    const invalid = this.error(
      'path must be dot-separated names from the configuration root, or after leading dots from the parent node',
      'path',
    );
    if (typeof text !== 'string') return invalid;
    const rest = text.replace(LEADING_DOTS_PATTERN, '');
    const up = text.length - rest.length;
    const path = rest.split(PATH_SEPARATOR).filter(Boolean);
    if ((up === 0 && path.length === 0) || rest.includes('..')) return invalid;
    this.up = up;
    this.path = path;
    return ok(undefined);
  };

  /**
   * Builds the full path for the node at `at` and keeps the types found at
   * it, through references and into every union option that has its next
   * segment; a path that is not in the schema fails.
   * @param root - the parsed root type
   * @param at - the configuration path of the node, with any index for items
   */
  resolve = (root: TypeElement, at: readonly string[]): ParseResult<void> => {
    const path = this.fullPath(at);
    if (path === undefined)
      return this.error(
        `${JSON.stringify(this.pathText)} goes above the configuration root`,
        'path',
      );
    let types = [unwrap(root)];
    const chain = [types[0]];
    for (const [index, segment] of path.entries()) {
      const next = types.flatMap(expand).flatMap((type) => {
        const found = step(type, segment);
        return found === undefined ? [] : [unwrap(found)];
      });
      if (next.length === 0)
        return this.error(
          `${this.describe(path.slice(0, index + 1))} is not in the schema`,
          'path',
        );
      types = next;
      chain.push(types[0]);
    }
    this.resolvedPath = path;
    this.resolved = types;
    this.chain = chain;
    return ok(undefined);
  };

  /**
   * The full configuration path for a node at `at`: the path from the root, or
   * after `at` without its last `up` segments; `undefined` above the root.
   * @param at - the configuration path of the node whose rule has the path
   */
  private fullPath = (at: readonly string[]): string[] | undefined => {
    if (this.up === 0) return [...this.path];
    const base = at.length - this.up;
    return base < 0 ? undefined : [...at.slice(0, base), ...this.path];
  };

  /**
   * The path at `segments` in messages, followed by the path as written when
   * it is relative (`"server.tls" (".tls")`).
   * @param segments - the full configuration path
   */
  private describe = (segments: readonly string[]): string => {
    const shown =
      segments.length === 0
        ? 'the configuration root'
        : JSON.stringify(
            segments
              .map((segment) =>
                segment === ANY_INDEX ? ANY_INDEX_SHOWN : segment,
              )
              .join(PATH_SEPARATOR),
          );
    return this.up === 0
      ? shown
      : `${shown} (${JSON.stringify(this.pathText)})`;
  };
}
