import { PathElement } from '../../../lib/elements/evaluators/pathElement';
import { step } from '../../../lib/utils/typeTree';
import { unwrap } from '../../testUtils';
import {
  errorPaths,
  evaluatorRoot,
  parseEvaluator,
  resolvedEvaluator,
} from './evaluatorsTestUtils';

describe('PathElement', () => {
  describe('parseNode', () => {
    /**
     * @target PathElement.parseNode should read absolute and relative paths
     * @dependencies
     * @scenario
     * - parse `server.port`, `..mode` and `.`
     * @expected
     * - each path as written
     */
    it('should read absolute and relative paths', () => {
      for (const path of ['server.port', '..mode', '.']) {
        const evaluator = unwrap(parseEvaluator({ path })) as PathElement;
        expect(evaluator.pathText).toEqual(path);
      }
    });

    /**
     * @target PathElement.parseNode should reject invalid paths
     * @dependencies
     * @scenario
     * - parse an empty path, a path with `..` inside and a number
     * @expected
     * - a problem at `path` each time
     */
    it('should reject invalid paths', () => {
      for (const path of ['', 'a..b', 5])
        expect(errorPaths(parseEvaluator({ path }))).toEqual(['e.path']);
    });
  });

  describe('resolve', () => {
    /**
     * @target PathElement.resolve should find the type at a relative path
     * @dependencies
     * @scenario
     * - resolve `.enabled` for the node `tls.cert`
     * @expected
     * - the boolean type
     */
    it('should find the type at a relative path', () => {
      expect(
        resolvedEvaluator({ path: '.enabled' }, ['tls', 'cert']).type?.kind,
      ).toEqual('boolean');
    });

    /**
     * @target PathElement.resolve should go through arrays, unions and
     * literals
     * @dependencies
     * @scenario
     * - resolve `nodes.0.url`, `store.w` and `kind`
     * @expected
     * - string, number, and the string type of the literal
     */
    it('should go through arrays, unions and literals', () => {
      expect(resolvedEvaluator({ path: 'nodes.0.url' }).type?.kind).toEqual(
        'string',
      );
      expect(resolvedEvaluator({ path: 'store.w' }).type?.kind).toEqual(
        'number',
      );
      expect(resolvedEvaluator({ path: 'kind' }).type?.kind).toEqual('string');
    });

    /**
     * @target PathElement.resolve should fail above the root or outside the
     * schema
     * @dependencies
     * @scenario
     * - resolve `...x` for the node `port`, then `tls.missing`
     * @expected
     * - a problem at `path` each time
     */
    it('should fail above the root or outside the schema', () => {
      const above = unwrap(parseEvaluator({ path: '...x' }));
      expect(errorPaths(above.resolve(evaluatorRoot, ['port']))).toEqual([
        'e.path',
      ]);
      const missing = unwrap(parseEvaluator({ path: 'tls.missing' }));
      expect(errorPaths(missing.resolve(evaluatorRoot, []))).toEqual([
        'e.path',
      ]);
    });
  });

  describe('bind', () => {
    /**
     * @target PathElement.bind should accept a scalar of the compared kind
     * @dependencies
     * @scenario
     * - bind `port` to the number type
     * @expected
     * - success
     */
    it('should accept a scalar of the compared kind', () => {
      const port = step(evaluatorRoot, 'port')!;
      expect(resolvedEvaluator({ path: 'port' }).bind(port).ok).toEqual(true);
    });

    /**
     * @target PathElement.bind should reject objects, mixed kinds and other
     * kinds
     * @dependencies
     * @scenario
     * - bind `tls`, `store.v` (string or number) and `tls.cert` to numbers
     * @expected
     * - a problem at `path` each time
     */
    it('should reject objects, mixed kinds and other kinds', () => {
      const port = step(evaluatorRoot, 'port')!;
      for (const path of ['tls', 'store.v', 'tls.cert'])
        expect(errorPaths(resolvedEvaluator({ path }).bind(port))).toEqual([
          'e.path',
        ]);
    });
  });

  describe('evaluate', () => {
    /**
     * @target PathElement.evaluate should convert the value it finds
     * @dependencies
     * @scenario
     * - evaluate `port` and `nodes.1.url` on a configuration
     * @expected
     * - the port converted to a number, and the url
     */
    it('should convert the value it finds', () => {
      expect(
        resolvedEvaluator({ path: 'port' }).evaluate({ port: '80' }, []),
      ).toEqual({ present: true, value: 80 });
      expect(
        resolvedEvaluator({ path: 'nodes.1.url' }).evaluate(
          { nodes: [{}, { url: 'u' }] },
          [],
        ),
      ).toEqual({ present: true, value: 'u' });
    });

    /**
     * @target PathElement.evaluate should use the defaults of missing nodes
     * @dependencies
     * @scenario
     * - evaluate `port`, `db.host` and `db.port` on an empty configuration
     * @expected
     * - 8080, `local` and 5432 from the defaults
     */
    it('should use the defaults of missing nodes', () => {
      expect(
        ['port', 'db.host', 'db.port'].map(
          (path) => resolvedEvaluator({ path }).evaluate({}, []).value,
        ),
      ).toEqual([8080, 'local', 5432]);
    });

    /**
     * @target PathElement.evaluate should not find missing items or values
     * that do not convert
     * @dependencies
     * @scenario
     * - evaluate `nodes.3.url`, `tls.cert` and `port` set to `"x"`
     * @expected
     * - not present each time
     */
    it('should not find missing items or values that do not convert', () => {
      expect(
        resolvedEvaluator({ path: 'nodes.3.url' }).evaluate({ nodes: [] }, [])
          .present,
      ).toEqual(false);
      expect(
        resolvedEvaluator({ path: 'tls.cert' }).evaluate({}, []).present,
      ).toEqual(false);
      expect(
        resolvedEvaluator({ path: 'port' }).evaluate({ port: 'x' }, []).present,
      ).toEqual(false);
    });

    /**
     * @target PathElement.evaluate should throw before it is resolved
     * @dependencies
     * @scenario
     * - evaluate a path that is not resolved
     * @expected
     * - an error is thrown
     */
    it('should throw before it is resolved', () => {
      expect(() => {
        unwrap(parseEvaluator({ path: 'port' })).evaluate({}, []);
      }).toThrow(Error);
    });
  });
});
