/**
 * Appends segments to a dotted pointer (`schema.properties.port`); schema
 * names cannot contain `.`, so they are joined as they are.
 * @param pointer - the pointer, `''` for the document root
 * @param segments - the segments to append
 */
export const appendPointer = (
  pointer: string,
  ...segments: (string | number)[]
): string =>
  [...(pointer === '' ? [] : [pointer]), ...segments.map(String)].join('.');

/**
 * The segments of a dotted pointer (`server.port` → `['server', 'port']`);
 * the empty pointer has none.
 * @param pointer - the pointer to split
 */
export const splitPointer = (pointer: string): string[] =>
  pointer === '' ? [] : pointer.split('.');
