import deepmerge from 'deepmerge';
import * as zod from 'zod';

import {
  FILTER_CONFIG_DEFAULT,
  FILTER_FIELD_NUMBER_OPERATORS,
  FILTER_FIELD_OPERATORS,
  FILTER_FIELD_STRING_ARRAY_OPERATORS,
  FILTER_FIELD_STRING_OPERATORS,
} from './constants';
import {
  Filter,
  FilterConfig,
  FilterField,
  FilterFieldConfig,
  FilterSort,
  FilterSortConfig,
  NumberFilterField,
  StringArrayFilterField,
  StringFilterField,
} from './types';

/**
 * TODO: Replace string-based validation errors with dedicated error classes
 * local:ergo/rosen-bridge/utils#309
 */
export class FilterParser {
  private config: FilterConfig;

  private schema: zod.ZodType<Filter>;

  constructor(config?: FilterConfig) {
    this.config = deepmerge(FILTER_CONFIG_DEFAULT, config || {});
    this.schema = this.createFilterSchema();
  }

  /**
   * Creates a Zod schema for a single filter field based on its configuration.
   * @param field The filter field configuration.
   * @returns A Zod schema for the given field.
   */
  private createFieldSchema = (
    field: FilterFieldConfig,
  ): zod.ZodType<FilterField> => {
    const operatorParamsError = {
      error: `Invalid operator for the '${field.key}' field`,
    };

    const valueParamsError = {
      error: `Invalid value for the '${field.key}' field`,
    };

    switch (field.type) {
      case 'number':
        return zod.object({
          key: zod.literal(field.key),
          type: zod.literal(field.type),
          operator: zod.enum(
            field.operators || FILTER_FIELD_NUMBER_OPERATORS,
            operatorParamsError,
          ),
          value: zod.number(valueParamsError),
        });
      case 'string':
        return zod.object({
          key: zod.literal(field.key),
          type: zod.literal(field.type),
          operator: zod.enum(
            field.operators || FILTER_FIELD_STRING_OPERATORS,
            operatorParamsError,
          ),
          value: field.values
            ? zod.enum(field.values, valueParamsError)
            : zod.string(),
        });
      case 'stringArray':
        return zod.object({
          key: zod.literal(field.key),
          type: zod.literal(field.type),
          operator: zod.enum(
            field.operators || FILTER_FIELD_STRING_ARRAY_OPERATORS,
            operatorParamsError,
          ),
          values: zod.array(
            field.values
              ? zod.enum(field.values, valueParamsError)
              : zod.string(),
          ),
        });
    }
  };

  /**
   * Builds the schema for all filter fields based on the configured field list.
   * @returns A Zod schema representing all possible filter fields.
   */
  private createFieldsSchema = (): zod.ZodType<Filter['fields']> => {
    if (!this.config.fields?.enable) {
      return zod.undefined({
        error: 'Filtering is disabled',
      });
    }

    const items =
      this.config.fields?.items?.map((item) => this.createFieldSchema(item)) ||
      [];

    if (!items.length) {
      return zod
        .array(
          zod.never({
            error: (iss) =>
              `The filter '${(iss.input as FilterField).key}' is not valid`,
          }),
        )
        .optional();
    }

    const schema = zod
      .array(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        zod.discriminatedUnion('key', items as any, {
          error: (iss) =>
            `The filter '${(iss.input as FilterField).key}' is not valid`,
        }),
      )
      .optional();

    return schema;
  };

  /**
   * Creates a Zod schema for pagination.
   * @returns A Zod schema for pagination configuration.
   */
  private createPaginationSchema = (): zod.ZodType<Filter['pagination']> => {
    if (!this.config.pagination?.enable) {
      return zod.undefined({
        error: 'Pagination is disabled',
      });
    }

    let limit = zod.number({
      error: 'Limit must be a number',
    });

    if (this.config.pagination?.limit?.min !== undefined) {
      limit = limit.min(this.config.pagination.limit.min, {
        error: `Limit cannot be smaller than ${this.config.pagination.limit.min}`,
      });
    }

    if (this.config.pagination?.limit?.max !== undefined) {
      limit = limit.max(this.config.pagination.limit.max, {
        error: `Limit cannot be greater than ${this.config.pagination.limit.max}`,
      });
    }

    if (this.config.pagination?.limit?.default !== undefined) {
      limit = limit.default(
        this.config.pagination.limit.default,
      ) as unknown as zod.ZodNumber;
    }

    let offset = zod.number({
      error: 'Offset must be a number',
    });

    if (this.config.pagination?.offset?.min !== undefined) {
      offset = offset.min(this.config.pagination.offset.min, {
        error: `Offset cannot be smaller than ${this.config.pagination.offset.min}`,
      });
    }

    if (this.config.pagination?.offset?.max !== undefined) {
      offset = offset.max(this.config.pagination.offset.max, {
        error: `Offset cannot be greater than ${this.config.pagination.offset.max}`,
      });
    }

    if (this.config.pagination?.offset?.default !== undefined) {
      offset = offset.default(
        this.config.pagination.offset.default,
      ) as unknown as zod.ZodNumber;
    }

    const schema = zod
      .object({
        limit: limit.optional(),
        offset: offset.optional(),
      })
      .prefault({})
      .optional();

    return schema;
  };

  /**
   * Creates a Zod schema for a single sort configuration.
   * @param sort The sort configuration.
   * @returns A Zod schema for the given sort field.
   */
  private createSortSchema = (
    sort: FilterSortConfig,
  ): zod.ZodType<FilterSort> => {
    const key = zod.literal(sort.key);

    let order = zod
      .enum(['ASC', 'DESC'], {
        error: (iss) =>
          `The value '${iss.input}' is not a valid sort order, Only 'ASC' or 'DESC' are allowed`,
      })
      .optional();

    if (sort.defaultOrder) {
      order = order.default(sort.defaultOrder) as unknown as zod.ZodOptional<
        zod.ZodEnum<{ ASC: 'ASC'; DESC: 'DESC' }>
      >;
    }

    return zod.object({ key, order });
  };

  /**
   * Creates a Zod schema for all sort configurations.
   * @returns A Zod schema for the sorts configuration.
   */
  private createSortsSchema = (): zod.ZodType<Filter['sorts']> => {
    if (!this.config.sorts?.enable) {
      return zod.undefined({
        error: 'Sorting is disabled',
      });
    }

    const items =
      this.config.sorts?.items?.map((item) => this.createSortSchema(item)) ||
      [];

    if (!items.length) {
      return zod
        .array(
          zod.never({
            error: (iss) =>
              `The sort '${(iss.input as FilterSort).key}' is not valid`,
          }),
        )
        .optional();
    }

    const schema = zod
      .array(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        zod.discriminatedUnion('key', items as any, {
          error: (iss) =>
            `The sort '${(iss.input as FilterSort).key}' is not valid`,
        }),
      )
      .optional();

    return schema;
  };

  /**
   * Creates the main Zod schema for the filter object.
   * @returns A Zod schema for the full filter.
   */
  private createFilterSchema = (): zod.ZodType<Filter> => {
    return zod.object({
      fields: this.createFieldsSchema(),
      pagination: this.createPaginationSchema(),
      sorts: this.createSortsSchema(),
    });
  };

  /**
   * Parses a URL into a raw Filter object before validation.
   * @param url The URL containing query parameters.
   * @returns A raw Filter object parsed from the URL.
   */
  private urlToFilter = (url: string): Filter => {
    const { searchParams } = new URL(url);

    const filters: Filter = {};

    if (searchParams.has('limit')) {
      filters.pagination ||= {};
      filters.pagination.limit = +searchParams.get('limit')!;
      searchParams.delete('limit');
    }

    if (searchParams.has('offset')) {
      filters.pagination ||= {};
      filters.pagination.offset = +searchParams.get('offset')!;
      searchParams.delete('offset');
    }

    if (searchParams.has('sorts')) {
      const raw = searchParams.get('sorts') || '';

      const values = raw.split(',');

      filters.sorts ||= [];

      for (const value of values) {
        const sections = value.split('-');

        const key = sections.at(0) as string;

        const order = sections.at(1) as FilterSort['order'];

        filters.sorts.push({ key, order });
      }

      searchParams.delete('sorts');
    }

    searchParams.forEach((value, key) => {
      const operator = [...FILTER_FIELD_OPERATORS]
        .sort((a, b) => b.symbol.length - a.symbol.length)
        .find((operator) => !operator.symbol || key.endsWith(operator.symbol));

      if (!operator) return;

      const name = operator.symbol ? key.split(operator.symbol)[0]! : key;

      const type = this.config.fields?.items?.find(
        (item) => item.key === name,
      )?.type;

      filters.fields ||= [];

      const field = {
        key: name,
        type,
        operator: operator.key,
      } as FilterField;

      switch (type) {
        case 'number': {
          (field as NumberFilterField).value = +value;
          break;
        }
        case 'string': {
          (field as StringFilterField).value = value;
          break;
        }
        case 'stringArray': {
          (field as StringArrayFilterField).values = value.split(',');
          break;
        }
      }

      filters.fields.push(field);
    });

    return filters;
  };

  /**
   * Parses and validates a URL into a strongly typed Filter object.
   * @param url The URL containing filter parameters.
   * @returns A validated Filter object.
   * @throws {Error} If validation fails.
   */
  public parse = (url: string): Filter => {
    const filter = this.urlToFilter(url);

    try {
      return this.schema.parse(filter);
    } catch (error) {
      let message: string | undefined;

      if (error instanceof zod.ZodError) {
        message = error.issues.at(0)?.message;
      }

      message ||= 'Unexpected Error';

      throw new Error(message, { cause: error });
    }
  };
}
