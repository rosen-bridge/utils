import { VBoolean, VNumeric, VString } from './validations';

export type ConfigSchema = Record<string, ConfigField>;

export type ConfigField = ObjectField | PrimitiveField;

export type PrimitiveField =
  | StringField
  | NumberField
  | BigIntField
  | BooleanField;

export type PrimitiveValue = string | boolean | number | bigint;

export interface ObjectField {
  type: 'object';
  description?: string;
  label?: string;
  children: ConfigSchema;
}

export interface GenericField<T> {
  default?: T;
  description?: string;
  label?: string;
}

export interface StringField extends GenericField<string> {
  type: 'string';
  validations?: VString[];
}

export interface NumberField extends GenericField<number> {
  type: 'number';
  validations?: VNumeric<number>[];
}

export interface BigIntField extends GenericField<bigint> {
  type: 'bigint';
  validations?: VNumeric<bigint>[];
}

export interface BooleanField extends GenericField<boolean> {
  type: 'boolean';
  validations?: VBoolean[];
}
