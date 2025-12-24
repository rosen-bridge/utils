import { describe, expect, it } from 'vitest';
import { FilterParser, FILTER_CONFIG_DEFAULT, FilterField } from '../lib';

describe('FilterParser', () => {
  describe('parse', () => {
    /**
     * @target FilterParser.parse should return an empty filter for URL without parameters
     * @dependencies
     * @scenario
     * - initialize `FilterParser` with default configuration
     * - prepare a URL without query parameters
     * - run test
     * - check returned value
     * @expected
     * - it should return expected filter object
     */
    it('should return an empty filter for URL without parameters', () => {
      const filterParser = new FilterParser();

      const filter = filterParser.parse('http://localhost');

      expect(Object.keys(filter)).toEqual([]);
    });

    /**
     * @target FilterParser.parse should throw error when filtering is disabled
     * @dependencies
     * @scenario
     * - initialize `FilterParser` with default configuration
     * - prepare a URL with a filter query parameter
     * - run test
     * - check returned value
     * @expected
     * - Error should be thrown
     */
    it('should throw error when filtering is disabled', () => {
      const filterParser = new FilterParser();

      expect(() => filterParser.parse(`http://localhost?key`)).toThrow(
        'Filtering is disabled',
      );
    });

    /**
     * @target FilterParser.parse should throw error if fields list is empty
     * @dependencies
     * @scenario
     * - initialize `FilterParser` with filtering enabled but empty fields list
     * - prepare a URL with the filter key
     * - run test
     * - check returned value
     * @expected
     * - Error should be thrown
     */
    it('should throw error if fields list is empty', () => {
      const key = 'age';

      const filterParser = new FilterParser({
        fields: {
          enable: true,
          items: [],
        },
      });

      expect(() => filterParser.parse(`http://localhost?${key}`)).toThrow(
        `The filter '${key}' is not valid`,
      );
    });

    /**
     * @target FilterParser.parse should parse a numeric filter
     * @dependencies
     * @scenario
     * - define a numeric filter field configuration
     * - initialize `FilterParser` with numeric field enabled
     * - prepare a URL with numeric comparison operator and value
     * - run test
     * - check returned value
     * @expected
     * - it should return expected filter object
     */
    it('should parse a numeric filter', () => {
      const field: FilterField = {
        key: 'age',
        type: 'number',
        operator: 'greaterThanOrEqual',
        value: 30,
      };

      const filterParser = new FilterParser({
        fields: {
          enable: true,
          items: [
            {
              key: field.key,
              type: field.type,
            },
          ],
        },
      });

      const filter = filterParser.parse(
        `http://localhost?${field.key}>=${field.value}`,
      );

      expect(filter.fields).toEqual([field]);
    });

    /**
     * @target FilterParser.parse should throw error for invalid number filter key
     * @dependencies
     * @scenario
     * - define a valid numeric field configuration
     * - initialize `FilterParser` with that field
     * - prepare a URL using an invalid filter key
     * - run test
     * - check returned value
     * @expected
     * - Error should be thrown
     */
    it('should throw error for invalid number filter key', () => {
      const invalidKey = 'key';

      const field: FilterField = {
        key: 'age',
        type: 'number',
        operator: 'greaterThanOrEqual',
        value: 30,
      };

      const filterParser = new FilterParser({
        fields: {
          enable: true,
          items: [
            {
              key: field.key,
              type: field.type,
            },
          ],
        },
      });

      expect(() =>
        filterParser.parse(`http://localhost?${invalidKey}>=${field.value}`),
      ).toThrow(`The filter '${invalidKey}' is not valid`);
    });

    /**
     * @target FilterParser.parse should throw error when operator is not allowed for a number field
     * @dependencies
     * @scenario
     * - define a numeric field with restricted operators
     * - initialize `FilterParser` with that configuration
     * - prepare a URL using a disallowed operator
     * - run test
     * - check returned value
     * @expected
     * - Error should be thrown
     */
    it('should throw error when operator is not allowed for a number field', () => {
      const field: FilterField = {
        key: 'age',
        type: 'number',
        operator: 'greaterThanOrEqual',
        value: 30,
      };

      const filterParser = new FilterParser({
        fields: {
          enable: true,
          items: [
            {
              key: field.key,
              type: field.type,
              operators: ['lessThanOrEqual'],
            },
          ],
        },
      });

      expect(() =>
        filterParser.parse(`http://localhost?${field.key}>=${field.value}`),
      ).toThrow(`Invalid operator for the '${field.key}' field`);
    });

    /**
     * @target FilterParser.parse should throw error for invalid numeric value
     * @dependencies
     * @scenario
     * - define a numeric field configuration
     * - initialize `FilterParser` with numeric filtering enabled
     * - prepare a URL with a non-numeric value
     * - run test
     * - check returned value
     * @expected
     * - Error should be thrown
     */
    it('should throw error for invalid numeric value', () => {
      const field: FilterField = {
        key: 'age',
        type: 'number',
        operator: 'greaterThanOrEqual',
        value: 30,
      };

      const filterParser = new FilterParser({
        fields: {
          enable: true,
          items: [
            {
              key: field.key,
              type: field.type,
            },
          ],
        },
      });

      expect(() =>
        filterParser.parse(`http://localhost?${field.key}>=hi`),
      ).toThrow(`Invalid value for the '${field.key}' field`);
    });

    /**
     * @target FilterParser.parse should parse a string filter
     * @dependencies
     * @scenario
     * - define a string filter field configuration
     * - initialize `FilterParser` with string field enabled
     * - prepare a URL with string equality operator and value
     * - run test
     * - check returned value
     * @expected
     * - it should return expected filter object
     */
    it('should parse a string filter', () => {
      const field: FilterField = {
        key: 'status',
        type: 'string',
        operator: 'equal',
        value: 'pending',
      };

      const filterParser = new FilterParser({
        fields: {
          enable: true,
          items: [
            {
              key: field.key,
              type: field.type,
            },
          ],
        },
      });

      const filter = filterParser.parse(
        `http://localhost?${field.key}=${field.value}`,
      );

      expect(filter.fields).toEqual([field]);
    });

    /**
     * @target FilterParser.parse should throw error for invalid string filter key
     * @dependencies
     * @scenario
     * - define a valid string field configuration
     * - initialize `FilterParser` with that field
     * - prepare a URL using an invalid filter key
     * - run test
     * - check returned value
     * @expected
     * - Error should be thrown
     */
    it('should throw error for invalid string filter key', () => {
      const invalidKey = 'key';

      const field: FilterField = {
        key: 'status',
        type: 'string',
        operator: 'equal',
        value: 'pending',
      };

      const filterParser = new FilterParser({
        fields: {
          enable: true,
          items: [
            {
              key: field.key,
              type: field.type,
            },
          ],
        },
      });

      expect(() =>
        filterParser.parse(`http://localhost?${invalidKey}=${field.value}`),
      ).toThrow(`The filter '${invalidKey}' is not valid`);
    });

    /**
     * @target FilterParser.parse should throw error when operator is not allowed for a string field
     * @dependencies
     * @scenario
     * - define a string field with restricted operators
     * - initialize `FilterParser` with that configuration
     * - prepare a URL using an unsupported operator
     * - run test
     * - check returned value
     * @expected
     * - Error should be thrown
     */
    it('should throw error when operator is not allowed for a string field', () => {
      const field: FilterField = {
        key: 'status',
        type: 'string',
        operator: 'equal',
        value: 'pending',
      };

      const filterParser = new FilterParser({
        fields: {
          enable: true,
          items: [
            {
              key: field.key,
              type: field.type,
              operators: ['startsWith'],
            },
          ],
        },
      });

      expect(() =>
        filterParser.parse(`http://localhost?${field.key}>=${field.value}`),
      ).toThrow(`Invalid operator for the '${field.key}' field`);
    });

    /**
     * @target FilterParser.parse should throw error for invalid string value
     * @dependencies
     * @scenario
     * - define a string field with restricted allowed values
     * - initialize `FilterParser` with that configuration
     * - prepare a URL using a value not in the allowed list
     * - run test
     * - check returned value
     * @expected
     * - Error should be thrown
     */
    it('should throw error for invalid string value', () => {
      const field: FilterField = {
        key: 'status',
        type: 'string',
        operator: 'equal',
        value: 'pending',
      };

      const filterParser = new FilterParser({
        fields: {
          enable: true,
          items: [
            {
              key: field.key,
              type: field.type,
              values: ['done'],
            },
          ],
        },
      });

      expect(() =>
        filterParser.parse(`http://localhost?${field.key}=${field.value}`),
      ).toThrow(`Invalid value for the '${field.key}' field`);
    });

    /**
     * @target FilterParser.parse should parse a stringArray filter
     * @dependencies
     * @scenario
     * - define a stringArray filter field configuration
     * - initialize `FilterParser` with stringArray field enabled
     * - prepare a URL using a valid array filter key
     * - run test
     * - check returned value
     * @expected
     * - it should return expected filter object
     */
    it('should parse a stringArray filter', () => {
      const field: FilterField = {
        key: 'tags',
        type: 'stringArray',
        operator: 'includes',
        values: ['js', 'ts'],
      };

      const filterParser = new FilterParser({
        fields: {
          enable: true,
          items: [
            {
              key: field.key,
              type: field.type,
            },
          ],
        },
      });

      const filter = filterParser.parse(
        `http://localhost?${field.key}[]=${field.values.join(',')}`,
      );

      expect(filter.fields).toEqual([field]);
    });

    /**
     * @target FilterParser.parse should throw error for invalid stringArray filter key
     * @dependencies
     * @scenario
     * - define a valid stringArray field configuration
     * - initialize `FilterParser` with that field
     * - prepare a URL using an invalid array filter key
     * - run test
     * - check returned value
     * @expected
     * - Error should be thrown
     */
    it('should throw error for invalid stringArray filter key', () => {
      const invalidKey = 'key';

      const field: FilterField = {
        key: 'tags',
        type: 'stringArray',
        operator: 'includes',
        values: ['js', 'ts'],
      };

      const filterParser = new FilterParser({
        fields: {
          enable: true,
          items: [
            {
              key: field.key,
              type: field.type,
            },
          ],
        },
      });

      expect(() =>
        filterParser.parse(
          `http://localhost?${invalidKey}[]=${field.values.join(',')}`,
        ),
      ).toThrow(`The filter '${invalidKey}' is not valid`);
    });

    /**
     * @target FilterParser.parse should throw error when operator is not allowed for a stringArray field
     * @dependencies
     * @scenario
     * - define a stringArray field with restricted operators
     * - initialize `FilterParser` with that configuration
     * - prepare a URL using a disallowed array operator
     * - run test
     * - check returned value
     * @expected
     * - Error should be thrown
     */
    it('should throw error when operator is not allowed for a stringArray field', () => {
      const field: FilterField = {
        key: 'tags',
        type: 'stringArray',
        operator: 'excludes',
        values: ['js', 'ts'],
      };

      const filterParser = new FilterParser({
        fields: {
          enable: true,
          items: [
            {
              key: field.key,
              type: field.type,
              operators: ['includes'],
            },
          ],
        },
      });

      expect(() =>
        filterParser.parse(
          `http://localhost?${field.key}[]!=${field.values.join(',')}`,
        ),
      ).toThrow(`Invalid operator for the '${field.key}' field`);
    });

    /**
     * @target FilterParser.parse should throw error for invalid stringArray value
     * @dependencies
     * @scenario
     * - define a stringArray field with restricted allowed values
     * - initialize `FilterParser` with that configuration
     * - prepare a URL using values outside the allowed list
     * - run test
     * - check returned value
     * @expected
     * - Error should be thrown
     */
    it('should throw error for invalid stringArray value', () => {
      const field: FilterField = {
        key: 'tags',
        type: 'stringArray',
        operator: 'includes',
        values: ['js', 'ts'],
      };

      const filterParser = new FilterParser({
        fields: {
          enable: true,
          items: [
            {
              key: field.key,
              type: field.type,
              values: ['js'],
            },
          ],
        },
      });

      expect(() =>
        filterParser.parse(
          `http://localhost?${field.key}[]=${field.values.join(',')}`,
        ),
      ).toThrow(`Invalid value for the '${field.key}' field`);
    });

    /**
     * @target FilterParser.parse should throw error when pagination is disabled
     * @dependencies
     * @scenario
     * - initialize `FilterParser` with default configuration
     * - prepare URLs with pagination parameters
     * - run test
     * - check returned value
     * @expected
     * - Error should be thrown
     */
    it('should throw error when pagination is disabled', () => {
      const filterParser = new FilterParser();

      expect(() => filterParser.parse(`http://localhost?limit`)).toThrow(
        'Pagination is disabled',
      );

      expect(() => filterParser.parse(`http://localhost?offset`)).toThrow(
        'Pagination is disabled',
      );
    });

    /**
     * @target FilterParser.parse should return default pagination values when enabled
     * @dependencies
     * @scenario
     * - initialize `FilterParser` with pagination enabled
     * - prepare a URL without pagination parameters
     * - run test
     * - check returned value
     * @expected
     * - it should return expected filter object
     */
    it('should return default pagination values when enabled', () => {
      const filterParser = new FilterParser({
        pagination: {
          enable: true,
        },
      });

      const filter = filterParser.parse(`http://localhost`);

      expect(filter.pagination?.limit).toBe(
        FILTER_CONFIG_DEFAULT.pagination.limit.default,
      );

      expect(filter.pagination?.offset).toBe(
        FILTER_CONFIG_DEFAULT.pagination.offset.default,
      );
    });

    /**
     * @target FilterParser.parse should use custom default pagination values
     * @dependencies
     * @scenario
     * - define custom default limit and offset values
     * - initialize `FilterParser` with custom pagination defaults
     * - prepare a URL without pagination parameters
     * - run test
     * - check returned value
     * @expected
     * - it should return expected filter object
     */
    it('should use custom default pagination values', () => {
      const LIMIT_DEFAULT = 20;

      const OFFSET_DEFAULT = 30;

      const filterParser = new FilterParser({
        pagination: {
          enable: true,
          limit: {
            default: LIMIT_DEFAULT,
          },
          offset: {
            default: OFFSET_DEFAULT,
          },
        },
      });

      const filter = filterParser.parse('http://localhost');

      expect(filter.pagination?.limit).toBe(LIMIT_DEFAULT);

      expect(filter.pagination?.offset).toBe(OFFSET_DEFAULT);
    });

    /**
     * @target FilterParser.parse should parse pagination values from URL
     * @dependencies
     * @scenario
     * - initialize `FilterParser` with pagination enabled
     * - prepare a URL with limit and offset query parameters
     * - run test
     * - check returned value
     * @expected
     * - it should return expected filter object
     */
    it('should parse pagination values from URL', () => {
      const LIMIT = 20;

      const OFFSET = 30;

      const filterParser = new FilterParser({
        pagination: {
          enable: true,
        },
      });

      const filter = filterParser.parse(
        `http://localhost?limit=${LIMIT}&offset=${OFFSET}`,
      );

      expect(filter.pagination?.limit).toBe(LIMIT);

      expect(filter.pagination?.offset).toBe(OFFSET);
    });

    /**
     * @target FilterParser.parse should throw if pagination values are below minimum
     * @dependencies
     * @scenario
     * - initialize `FilterParser` with pagination enabled
     * - prepare URLs with limit and offset below minimum values
     * - run test
     * - check returned value
     * @expected
     * - Error should be thrown
     */
    it('should throw if pagination values are below minimum', () => {
      const filterParser = new FilterParser({
        pagination: {
          enable: true,
        },
      });

      const limit = FILTER_CONFIG_DEFAULT.pagination.limit.min - 1;

      expect(() =>
        filterParser.parse(`http://localhost?limit=${limit}`),
      ).toThrow(
        `Limit cannot be smaller than ${FILTER_CONFIG_DEFAULT.pagination.limit.min}`,
      );

      const offset = FILTER_CONFIG_DEFAULT.pagination.offset.min - 1;

      expect(() =>
        filterParser.parse(`http://localhost?offset=${offset}`),
      ).toThrow(
        `Offset cannot be smaller than ${FILTER_CONFIG_DEFAULT.pagination.offset.min}`,
      );
    });

    /**
     * @target FilterParser.parse should throw if pagination values are above maximum
     * @dependencies
     * @scenario
     * - initialize `FilterParser` with pagination enabled and custom maximum offset
     * - prepare URLs with limit and offset above maximum values
     * - run test
     * - check returned value
     * @expected
     * - Error should be thrown
     */
    it('should throw if pagination values are above maximum', () => {
      const OFFSET_MAX = 1000;

      const filterParser = new FilterParser({
        pagination: {
          enable: true,
          offset: {
            max: OFFSET_MAX,
          },
        },
      });

      const limit = FILTER_CONFIG_DEFAULT.pagination.limit.max + 1;

      expect(() =>
        filterParser.parse(`http://localhost?limit=${limit}`),
      ).toThrow(
        `Limit cannot be greater than ${FILTER_CONFIG_DEFAULT.pagination.limit.max}`,
      );

      const offset = OFFSET_MAX + 1;

      expect(() =>
        filterParser.parse(`http://localhost?offset=${offset}`),
      ).toThrow(`Offset cannot be greater than ${OFFSET_MAX}`);
    });

    /**
     * @target FilterParser.parse should respect custom minimum values
     * @dependencies
     * @scenario
     * - initialize `FilterParser` with pagination enabled and custom minimum limit and offset
     * - prepare URLs with limit and offset below the custom minimums
     * - run test
     * - check returned value
     * @expected
     * - Error should be thrown
     */
    it('should respect custom minimum values', () => {
      const LIMIT_MIN = 30;

      const OFFSET_MIN = 40;

      const filterParser = new FilterParser({
        pagination: {
          enable: true,
          limit: {
            min: LIMIT_MIN,
          },
          offset: {
            min: OFFSET_MIN,
          },
        },
      });

      expect(() =>
        filterParser.parse(`http://localhost?limit=${LIMIT_MIN - 1}`),
      ).toThrow(`Limit cannot be smaller than ${LIMIT_MIN}`);

      expect(() =>
        filterParser.parse(`http://localhost?offset=${OFFSET_MIN - 1}`),
      ).toThrow(`Offset cannot be smaller than ${OFFSET_MIN}`);
    });

    /**
     * @target FilterParser.parse should respect custom maximum values
     * @dependencies
     * @scenario
     * - initialize `FilterParser` with pagination enabled and custom maximum limit and offset
     * - prepare URLs with limit and offset above the custom maximums
     * - run test
     * - check returned value
     * @expected
     * - Error should be thrown
     */
    it('should respect custom maximum values', () => {
      const LIMIT_MAX = 30;

      const OFFSET_MAX = 40;

      const filterParser = new FilterParser({
        pagination: {
          enable: true,
          limit: {
            max: LIMIT_MAX,
          },
          offset: {
            max: OFFSET_MAX,
          },
        },
      });

      expect(() =>
        filterParser.parse(`http://localhost?limit=${LIMIT_MAX + 1}`),
      ).toThrow(`Limit cannot be greater than ${LIMIT_MAX}`);

      expect(() =>
        filterParser.parse(`http://localhost?offset=${OFFSET_MAX + 1}`),
      ).toThrow(`Offset cannot be greater than ${OFFSET_MAX}`);
    });

    /**
     * @target FilterParser.parse should throw error when sorting is disabled
     * @dependencies
     * @scenario
     * - initialize `FilterParser` with default configuration
     * - prepare a URL with sorting parameters
     * - run test
     * - check returned value
     * @expected
     * - Error should be thrown
     */
    it('should throw error when sorting is disabled', () => {
      const filterParser = new FilterParser();

      expect(() => filterParser.parse(`http://localhost?sorts`)).toThrow(
        'Sorting is disabled',
      );
    });

    /**
     * @target FilterParser.parse should throw error if sort key is not in config
     * @dependencies
     * @scenario
     * - initialize `FilterParser` with sorting enabled
     * - prepare a URL using a sort key that is not in the configuration items
     * - run test
     * - check returned value
     * @expected
     * - Error should be thrown
     */
    it('should throw error if sort key is not in config', () => {
      const key = 'key';

      const filterParser = new FilterParser({
        sorts: {
          enable: true,
        },
      });

      expect(() => filterParser.parse(`http://localhost?sorts=${key}`)).toThrow(
        `The sort '${key}' is not valid`,
      );
    });

    /**
     * @target FilterParser.parse should parse multiple sort keys
     * @dependencies
     * @scenario
     * - define multiple valid sort keys
     * - initialize `FilterParser` with sorting enabled and multiple items
     * - prepare a URL with multiple sort keys
     * - run test
     * - check returned value
     * @expected
     * - it should return expected filter object
     */
    it('should parse multiple sort keys', () => {
      const key1 = 'key1';
      const key2 = 'key2';

      const filterParser = new FilterParser({
        sorts: {
          enable: true,
          items: [{ key: key1 }, { key: key2 }],
        },
      });

      const filter = filterParser.parse(
        `http://localhost?sorts=${key1},${key2}`,
      );

      expect(filter.sorts).toEqual([{ key: key1 }, { key: key2 }]);
    });

    /**
     * @target FilterParser.parse should parse a sort key with explicit order
     * @dependencies
     * @scenario
     * - initialize `FilterParser` with sorting enabled and a valid sort key
     * - prepare a URL with the sort key and explicit sort order
     * - run test
     * - check returned value
     * @expected
     * - it should return expected filter object
     */
    it('should parse a sort key with explicit order', () => {
      const key = 'key';
      const order = 'ASC';

      const filterParser = new FilterParser({
        sorts: {
          enable: true,
          items: [{ key }],
        },
      });

      const filter = filterParser.parse(
        `http://localhost?sorts=${key}-${order}`,
      );

      expect(filter.sorts).toEqual([{ key, order }]);
    });

    /**
     * @target FilterParser.parse should throw error for invalid sort order
     * @dependencies
     * @scenario
     * - initialize `FilterParser` with sorting enabled
     * - prepare a URL with a sort key and invalid order
     * - run test
     * - check returned value
     * @expected
     * - Error should be thrown
     */
    it('should throw error for invalid sort order', () => {
      const key = 'key';
      const order = 'wrong';

      const filterParser = new FilterParser({
        sorts: {
          enable: true,
          items: [{ key }],
        },
      });

      expect(() =>
        filterParser.parse(`http://localhost?sorts=${key}-${order}`),
      ).toThrow(
        `The value '${order}' is not a valid sort order, Only 'ASC' or 'DESC' are allowed`,
      );
    });

    /**
     * @target FilterParser.parse should throw error if sort list is empty
     * @dependencies
     * @scenario
     * - initialize `FilterParser` with sorting enabled but empty items
     * - prepare a URL with a sort key
     * - run test
     * - check returned value
     * @expected
     * - Error should be thrown
     */
    it('should throw error if sort list is empty', () => {
      const key = 'key';

      const filterParser = new FilterParser({
        sorts: {
          enable: true,
          items: [],
        },
      });

      expect(() => filterParser.parse(`http://localhost?sorts=${key}`)).toThrow(
        `The sort '${key}' is not valid`,
      );
    });

    /**
     * @target FilterParser.parse should throw error when sort key is not defined in config items
     * @dependencies
     * @scenario
     * - initialize `FilterParser` with sorting enabled and only specific keys in items
     * - prepare a URL using a sort key that is not in the allowed items list
     * - run test
     * - check returned value
     * @expected
     * - Error should be thrown
     */
    it('should throw error when sort key is not defined in config items', () => {
      const key1 = 'key1';
      const key2 = 'key2';

      const filterParser = new FilterParser({
        sorts: {
          enable: true,
          items: [{ key: key1 }],
        },
      });

      expect(() =>
        filterParser.parse(`http://localhost?sorts=${key2}`),
      ).toThrow(`The sort '${key2}' is not valid`);
    });

    /**
     * @target FilterParser.parse should apply default order when defined in config
     * @dependencies
     * @scenario
     * - initialize `FilterParser` with sorting enabled and defaultOrder for a key
     * - prepare a URL with that sort key without order
     * - run test
     * - check returned value
     * @expected
     * - it should return expected filter object
     */
    it('should apply default order when defined in config', () => {
      const key = 'key';
      const order = 'ASC';

      const filterParser = new FilterParser({
        sorts: {
          enable: true,
          items: [
            {
              key: key,
              defaultOrder: order,
            },
          ],
        },
      });

      const filter = filterParser.parse(`http://localhost?sorts=${key}`);

      expect(filter.sorts).toEqual([{ key, order }]);
    });

    /**
     * @target FilterParser.parse should handle mixed explicit and default orders
     * @dependencies
     * @scenario
     * - initialize `FilterParser` with sorting enabled and multiple keys with default orders
     * - prepare a URL with a mix of explicit and default sort orders
     * - run test
     * - check returned value
     * @expected
     * - it should return expected filter object
     */
    it('should handle mixed explicit and default orders', () => {
      const key1 = 'key1';
      const order1 = 'ASC';

      const key2 = 'key2';
      const order2 = 'DESC';

      const filterParser = new FilterParser({
        sorts: {
          enable: true,
          items: [
            {
              key: key1,
              defaultOrder: order1,
            },
            {
              key: key2,
              defaultOrder: order2,
            },
          ],
        },
      });

      const filter = filterParser.parse(
        `http://localhost?sorts=${key1}-${order2},${key2}`,
      );

      expect(filter.sorts).toEqual([
        { key: key1, order: order2 },
        { key: key2, order: order2 },
      ]);
    });
  });
});
