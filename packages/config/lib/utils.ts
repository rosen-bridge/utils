import { IConfigSource } from 'config';
import path from 'path';

/**
 * returns the value at a path in the passed object, and if it has a value
 * defined at that path
 *
 * @param {*} obj
 * @param {string[]} path path to the value to be returned
 * @return {{ defined: boolean; value: any }}
 */
export const getValue = (
  obj: any,
  path: string[]
): { defined: boolean; value: any } => {
  let value = obj;
  for (const key of path) {
    if (value != undefined && Object.hasOwn(value, key)) {
      value = value[key];
    } else {
      return { defined: false, value: undefined };
    }
  }
  return { defined: true, value };
};

/**
 * returns source name/level for a node config source
 *
 * @export
 * @param {IConfigSource} source
 * @return {string}
 */
export const getSourceName = (source: IConfigSource): string => {
  return source.name.startsWith('$')
    ? source.name
    : path.parse(source.name).name;
};
