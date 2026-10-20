import type { ElementClass } from '../elements/elementsMap.js';
import type { SchemaElement } from '../elements/schemaElement.js';

/**
 * The classes of `module` that extend `base` and implement `kind` on their
 * own prototype, without `excluded`, by kind and sorted by kind. Throws when
 * two classes have the same kind.
 * @param module - the exports of a folder
 * @param base - the base class of the wanted classes
 * @param excluded - classes to leave out
 */
export const findClasses = <T extends SchemaElement>(
  module: Record<string, unknown>,
  base: abstract new (...args: never[]) => T,
  excluded: readonly unknown[] = [],
): ReadonlyMap<string, ElementClass<T>> => {
  const found = new Map<string, ElementClass<T>>();
  for (const value of Object.values(module)) {
    if (
      typeof value !== 'function' ||
      !(value.prototype instanceof base) ||
      excluded.includes(value)
    )
      continue;
    const element = value as unknown as ElementClass<T>;
    if (!Object.hasOwn(element.prototype, 'kind')) continue;
    const { kind } = element.prototype;
    if (found.has(kind))
      throw new Error(
        `two ${base.name} classes have the kind ${JSON.stringify(kind)}`,
      );
    found.set(kind, element);
  }
  return new Map([...found].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)));
};
