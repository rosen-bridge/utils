import { describe, expect, it } from 'vitest';
import { FilterParser, FILTER_CONFIG_DEFAULT } from '../lib';

describe('Filter', () => {
  it('should return an empty filter for URL without parameters', () => {
    const filterParser = new FilterParser();

    const filter = filterParser.parse('http://localhost');

    expect(Object.keys(filter)).toEqual([]);
  });

  describe('Fields', () => {
    it('should throw error when filtering is disabled', () => {
      const filterParser = new FilterParser();

      expect(() => filterParser.parse(`http://localhost?key`)).toThrow(
        'Filtering is disabled',
      );
    });
  });

  describe('Pagination', () => {
    it('should throw error when pagination is disabled', () => {
      const filterParser = new FilterParser();

      expect(() => filterParser.parse(`http://localhost?limit`)).toThrow(
        'Pagination is disabled',
      );

      expect(() => filterParser.parse(`http://localhost?offset`)).toThrow(
        'Pagination is disabled',
      );
    });

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
  });

  describe('Sorts', () => {
    it('should throw error when sorting is disabled', () => {
      const filterParser = new FilterParser();

      expect(() => filterParser.parse(`http://localhost?sorts`)).toThrow(
        'Sorting is disabled',
      );
    });

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
