import { PrimitiveValue } from './fields';

export type Validation =
  | VAll
  | VString
  | VBoolean
  | VNumeric<number>
  | VNumeric<bigint>;

export interface When {
  path: string;
  value: PrimitiveValue;
}

export interface VGeneric {
  error?: string;
  when?: When;
}

// validators for all types
export type VAll = VRequired;

export interface VRequired extends VGeneric {
  required: boolean;
}

// string validators
export type VString = VAll | VRegex | VChoices;

export interface VRegex extends VGeneric {
  regex: string;
}

export interface VChoices extends VGeneric {
  choices: string[];
}

// boolean validators
export type VBoolean = VAll;

// numeric validators
export type VNumeric<T extends number | bigint> =
  | VAll
  | VGreater<T>
  | VGreaterEqual<T>
  | VLess<T>
  | VLessEqual<T>;

export interface VGreater<T extends number | bigint> extends VGeneric {
  gt: T;
}

export interface VGreaterEqual<T extends number | bigint> extends VGeneric {
  gte: T;
}

export interface VLess<T extends number | bigint> extends VGeneric {
  lt: T;
}

export interface VLessEqual<T extends number | bigint> extends VGeneric {
  lte: T;
}
