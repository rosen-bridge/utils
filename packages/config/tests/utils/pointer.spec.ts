import { appendPointer, splitPointer } from '../../lib/utils/pointer';

describe('pointer', () => {
  describe('appendPointer', () => {
    /**
     * @target appendPointer should join segments with dots
     * @dependencies
     * @scenario
     * - append a name and an index to a pointer
     * @expected
     * - the dotted pointer
     */
    it('should join segments with dots', () => {
      expect(appendPointer('schema', 'items', 0)).toEqual('schema.items.0');
    });

    /**
     * @target appendPointer should start from the root for an empty pointer
     * @dependencies
     * @scenario
     * - append a segment to `''`
     * @expected
     * - the segment alone
     */
    it('should start from the root for an empty pointer', () => {
      expect(appendPointer('', 'port')).toEqual('port');
    });
  });

  describe('splitPointer', () => {
    /**
     * @target splitPointer should split a pointer into its segments
     * @dependencies
     * @scenario
     * - split `server.port` and `''`
     * @expected
     * - the two segments, and none for the root
     */
    it('should split a pointer into its segments', () => {
      expect(splitPointer('server.port')).toEqual(['server', 'port']);
      expect(splitPointer('')).toEqual([]);
    });
  });
});
