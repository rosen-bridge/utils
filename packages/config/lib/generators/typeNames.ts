import { typeName } from '../utils/format.js';

/**
 * Names of the declared TypeScript types: the last segment of a type's path
 * (`Limits`), or its whole path (`ConfigLimits`) when another type has that
 * name. Types are generated twice: the first pass collects the names.
 */
export class TypeNames {
  /**
   * The pointers of the types that have each name.
   */
  private readonly pointers = new Map<string, Set<string>>();

  private collecting = true;

  /**
   * The name of a type: the last segment of its path, or the whole path when
   * another type has the same name (once collecting is finished).
   * @param path - the path of the type (`['config', 'limits']`)
   * @param pointer - the pointer of the type in the schema document
   */
  name = (path: readonly string[], pointer: string): string => {
    const name = typeName(path[path.length - 1]);
    if (this.collecting) {
      const pointers = this.pointers.get(name) ?? new Set();
      this.pointers.set(name, pointers.add(pointer));
      return name;
    }
    return (this.pointers.get(name)?.size ?? 0) > 1
      ? path.map(typeName).join('')
      : name;
  };

  /**
   * Ends collecting: names are final from now on.
   */
  finish = (): void => {
    this.collecting = false;
  };
}
