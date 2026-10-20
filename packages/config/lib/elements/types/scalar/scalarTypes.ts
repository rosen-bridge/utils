import { BigintElement } from './bigintElement.js';
import { BooleanElement } from './booleanElement.js';
import { NumberElement } from './numberElement.js';
import { StringElement } from './stringElement.js';

/**
 * The scalar type classes, whose kinds are the `typeof` of their values
 * (`string`, `number`, `bigint`, `boolean`). Rules and types that read a
 * value as one of them (`enum`, `literal`) find its class here.
 */
export const SCALAR_TYPES = [
  StringElement,
  NumberElement,
  BigintElement,
  BooleanElement,
];
