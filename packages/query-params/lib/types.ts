import {
  FILTER_FIELD_NUMBER_OPERATORS,
  FILTER_FIELD_STRING_OPERATORS,
  FILTER_FIELD_STRING_ARRAY_OPERATORS,
} from './constants';

/**
 * Field
 */

export type NumberOperator = (typeof FILTER_FIELD_NUMBER_OPERATORS)[number];

export type NumberFilterField = {
  key: string;
  type: 'number';
  operator: NumberOperator;
  value: number;
};

export type NumberFilterFieldConfig = {
  key: string;
  type: 'number';
  operators?: NumberOperator[];
};

export type StringOperator = (typeof FILTER_FIELD_STRING_OPERATORS)[number];

export type StringFilterField = {
  key: string;
  type: 'string';
  operator: StringOperator;
  value: string;
};

export type StringFilterFieldConfig = {
  key: string;
  type: 'string';
  operators?: StringOperator[];
  values?: string[];
};

export type StringArrayOperator =
  (typeof FILTER_FIELD_STRING_ARRAY_OPERATORS)[number];

export type StringArrayFilterField = {
  key: string;
  type: 'stringArray';
  operator: StringArrayOperator;
  values: string[];
};

export type StringArrayFilterFieldConfig = {
  key: string;
  type: 'stringArray';
  operators?: StringArrayOperator[];
  values?: string[];
};

export type FilterField =
  | NumberFilterField
  | StringFilterField
  | StringArrayFilterField;

export type FilterFieldConfig =
  | NumberFilterFieldConfig
  | StringFilterFieldConfig
  | StringArrayFilterFieldConfig;

/**
 * Pagination
 */

export type FilterPagination = {
  offset?: number;
  limit?: number;
};

export type FilterPaginationFieldConfig = {
  min?: number;
  max?: number;
  default?: number;
};

export type FilterPaginationConfig = {
  enable?: boolean;
  offset?: FilterPaginationFieldConfig;
  limit?: FilterPaginationFieldConfig;
};

/**
 * Sort
 */

export type FilterSort = {
  key: string;
  order?: 'ASC' | 'DESC';
};

export type FilterSortConfig = {
  key: string;
  defaultOrder?: 'ASC' | 'DESC';
};

export type FilterSortsConfig = {
  enable?: boolean;
  items?: FilterSortConfig[];
};

/**
 * Root
 */

export type FilterFieldsConfig = {
  enable?: boolean;
  items?: FilterFieldConfig[];
};

export type Filter = {
  fields?: FilterField[];
  pagination?: FilterPagination;
  sorts?: FilterSort[];
};

export type FilterConfig = {
  fields?: FilterFieldsConfig;
  pagination?: FilterPaginationConfig;
  sorts?: FilterSortsConfig;
};
