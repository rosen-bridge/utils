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
  FilterPaginationFieldConfig,
  FilterSort,
  FilterSortConfig,
  NumberFilterField,
  NumberOperator,
  StringArrayFilterField,
  StringArrayOperator,
  StringFilterField,
  StringOperator,
} from './types';

/**
 * TODO: Replace string-based validation errors with dedicated error classes
 * local:ergo/rosen-bridge/utils#309
 */
export class FilterParser {
  private config: FilterConfig;

  public schema: zod.ZodType<Filter>;

  public querySchema: zod.ZodPipeline<
    zod.ZodEffects<zod.ZodType<Record<string, string | undefined>>, Filter>,
    zod.ZodType<Filter>
  >;

  public urlSchema: zod.ZodPipeline<
    zod.ZodEffects<zod.ZodString, Filter>,
    zod.ZodType<Filter>
  >;

  constructor(config: FilterConfig = {}) {
    this.config = deepmerge(FILTER_CONFIG_DEFAULT, config);

    this.schema = this.createFilterSchema();

    this.querySchema = this.createQuerySchema()
      .transform<Filter>((query) => {
        const queryString = decodeURIComponent(
          new URLSearchParams(query as Record<string, string>).toString(),
        );

        return this.urlToFilter('?' + queryString);
      })
      .pipe(this.schema);

    this.urlSchema = zod
      .string()
      .transform<Filter>(this.urlToFilter)
      .pipe(this.schema);
  }

  /**
   * Creates a Zod schema for a single filter field based on its configuration.
   * @param field The filter field configuration.
   * @returns A Zod schema for the given field.
   */
  private createFieldSchema = (
    field: FilterFieldConfig,
  ): zod.ZodType<FilterField> => {
    const operatorParamsError: zod.RawCreateParams = {
      message: `Invalid operator for the '${field.key}' field`,
    };

    const valueParamsError: zod.RawCreateParams = {
      message: `Invalid value for the '${field.key}' field`,
    };

    switch (field.type) {
      case 'number':
        return zod.object({
          key: zod.literal(field.key),
          type: zod.literal(field.type),
          operator: zod.enum(
            (field.operators ||
              FILTER_FIELD_NUMBER_OPERATORS) as typeof FILTER_FIELD_NUMBER_OPERATORS,
            operatorParamsError,
          ),
          value: zod.number(valueParamsError),
        });
      case 'string':
        return zod.object({
          key: zod.literal(field.key),
          type: zod.literal(field.type),
          operator: zod.enum(
            (field.operators ||
              FILTER_FIELD_STRING_OPERATORS) as typeof FILTER_FIELD_STRING_OPERATORS,
            operatorParamsError,
          ),
          value: field.values
            ? zod.enum(field.values as [string], valueParamsError)
            : zod.string(),
        });
      case 'stringArray':
        return zod.object({
          key: zod.literal(field.key),
          type: zod.literal(field.type),
          operator: zod.enum(
            (field.operators ||
              FILTER_FIELD_STRING_ARRAY_OPERATORS) as typeof FILTER_FIELD_STRING_ARRAY_OPERATORS,
            operatorParamsError,
          ),
          values: zod.array(
            field.values
              ? zod.enum(field.values as [string], valueParamsError)
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
        invalid_type_error: 'Filtering is disabled',
      });
    }

    const items = this.config.fields.items?.map(this.createFieldSchema) ?? [];

    return zod
      .array(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        zod.discriminatedUnion('key', items as any, {
          errorMap: (_, ctx) => ({
            message: `The filter '${(ctx.data as FilterField).key}' is not valid`,
          }),
        }),
      )
      .optional();
  };

  /**
   * Creates a Zod schema for pagination.
   * @returns A Zod schema for pagination configuration.
   */
  private createPaginationSchema = (): zod.ZodType<Filter['pagination']> => {
    const pagination = this.config.pagination;

    if (!pagination?.enable) {
      return zod.undefined({
        invalid_type_error: 'Pagination is disabled',
      });
    }

    const createPaginationFieldSchema = (
      label: string,
      rules?: FilterPaginationFieldConfig,
    ) => {
      const min = rules?.min;
      const max = rules?.max;
      const defaultValue = rules?.default;

      let schema = zod.number({
        invalid_type_error: `${label} must be a number`,
      });

      if (min !== undefined)
        schema = schema.min(min, {
          message: `${label} cannot be smaller than ${min}`,
        });

      if (max !== undefined)
        schema = schema.max(max, {
          message: `${label} cannot be greater than ${max}`,
        });

      return defaultValue !== undefined
        ? schema.optional().default(defaultValue)
        : schema.optional();
    };

    const schema = zod
      .object({
        limit: createPaginationFieldSchema('Limit', pagination.limit),
        offset: createPaginationFieldSchema('Offset', pagination.offset),
      })
      .optional();

    const paginationHasDefault =
      this.config.pagination?.enable &&
      (this.config.pagination.offset?.default ||
        this.config.pagination.limit?.default);

    return paginationHasDefault ? schema.default(() => ({})) : schema;
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

    const order = zod
      .enum(['ASC', 'DESC'], {
        errorMap: (_, ctx) => ({
          message: `The value '${ctx.data}' is not a valid sort order, Only 'ASC' or 'DESC' are allowed`,
        }),
      })
      .optional();

    if (sort.defaultOrder) {
      return zod.object({ key, order: order.default(sort.defaultOrder) });
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
        invalid_type_error: 'Sorting is disabled',
      });
    }

    const items = this.config.sorts.items?.map(this.createSortSchema) ?? [];

    return zod
      .array(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        zod.discriminatedUnion('key', items as any, {
          errorMap: (_, ctx) => ({
            message: `The sort '${(ctx.data as FilterSort).key}' is not valid`,
          }),
        }),
      )
      .optional();
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
   * Creates a Zod schema for the query object used as fastify querystring schema.
   * @returns A Zod schema for the querystring.
   */
  private createQuerySchema = () => {
    let schema = zod.object(
      {} as Record<string, zod.ZodOptional<zod.ZodString>>,
    );

    if (this.config.pagination?.enable)
      schema = schema.extend({
        offset: zod.string().optional(),
        limit: zod.string().optional(),
      });

    if (this.config.sorts?.enable)
      schema = schema.extend({
        sorts: zod.string().optional(),
      });

    if (this.config.fields?.enable) {
      this.config.fields.items?.forEach((field) => {
        let operators:
          | (NumberOperator | StringOperator | StringArrayOperator)[]
          | undefined = field.operators;

        if (operators === undefined)
          switch (field.type) {
            case 'number':
              operators = FILTER_FIELD_NUMBER_OPERATORS.slice();
              break;
            case 'string':
              operators = FILTER_FIELD_STRING_OPERATORS.slice();
              break;
            case 'stringArray':
              operators = FILTER_FIELD_STRING_ARRAY_OPERATORS.slice();
              break;
          }

        operators.forEach((operator) => {
          const operatorSymbol =
            FILTER_FIELD_OPERATORS.find((op) => op.key === operator)?.symbol ??
            '';
          const key = `${field.key}${operatorSymbol}`;

          schema = schema.extend({
            [key]: zod.string().optional(),
          });
        });
      });
    }

    return schema;
  };

  /**
   * Parses a URL into a raw Filter object before validation.
   * @param url The URL containing query parameters.
   * @returns A raw Filter object parsed from the URL.
   */
  private urlToFilter = (url: string): Filter => {
    const { searchParams } = new URL(url, 'http://localhost');

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
    try {
      return this.urlSchema.parse(url);
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
