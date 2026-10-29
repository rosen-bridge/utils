import { ImportGraph } from '../../../lib/elements/document/importGraph';
import { ok } from '../../../lib/parsing/result';
import { createScope } from '../../testUtils';

describe('ImportGraph', () => {
  describe('cycle', () => {
    /**
     * @target ImportGraph.cycle should find a file that is being parsed
     * @dependencies
     * @scenario
     * - check the root file, and a file while it is being loaded
     * @expected
     * - the chain back to the file each time; none for another file
     */
    it('should find a file that is being parsed', () => {
      const graph = new ImportGraph('/a.json');
      expect(graph.cycle('/a.json')).toEqual(['/a.json', '/a.json']);
      expect(graph.cycle('/b.json')).toEqual(undefined);
      graph.load('/b.json', () => {
        expect(graph.cycle('/a.json')).toEqual([
          '/a.json',
          '/b.json',
          '/a.json',
        ]);
        return ok(createScope());
      });
      expect(new ImportGraph().cycle('/a.json')).toEqual(undefined);
    });
  });

  describe('load', () => {
    /**
     * @target ImportGraph.load should parse each file once
     * @dependencies
     * @scenario
     * - load the same file twice
     * @expected
     * - the parser is called once and the same result is returned
     */
    it('should parse each file once', () => {
      const graph = new ImportGraph();
      const parse = vi.fn(() => ok(createScope()));
      const first = graph.load('/c.json', parse);
      expect(graph.load('/c.json', parse)).toBe(first);
      expect(parse).toHaveBeenCalledTimes(1);
    });
  });
});
