import { ParseResult, fail } from '../parsing/result.js';
import { appendPointer } from './pointer.js';

/**
 * Failed result with one problem at `pointer`, or at `segments` below it.
 * @param message - the problem
 * @param pointer - the dotted pointer of the problem
 * @param segments - members below `pointer`
 */
export const failAt = (
  message: string,
  pointer: string,
  ...segments: (string | number)[]
): ParseResult<never> => {
  return fail([{ path: appendPointer(pointer, ...segments), message }]);
};
