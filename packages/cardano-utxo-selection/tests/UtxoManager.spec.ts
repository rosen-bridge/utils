import { UtxoManager } from '../lib';
import { utxoWithOutIndex } from './testData';

describe('UtxoManager', () => {
  describe('next', () => {
    /**
     * @target UtxoManager.next should return boxes sequentially
     * @dependencies
     * @scenario
     * - create a UtxoManager
     *   - type is number
     *   - serializer will return a pre generated
     *     CardanoUtxo with given input as index
     *   - initial array has 3 elements
     * - run test (call `next` 3 times)
     * - check returned value for each call
     * @expected
     * - it should return all elements sequentially
     */
    it('should return boxes sequentially', async () => {
      const manager = new UtxoManager<number>([2, 4, 6], (num: number) => ({
        ...utxoWithOutIndex,
        index: num * 10,
      }));

      let res = await manager.next();
      expect(res).toEqual({ ...utxoWithOutIndex, index: 20 });
      res = await manager.next();
      expect(res).toEqual({ ...utxoWithOutIndex, index: 40 });
      res = await manager.next();
      expect(res).toEqual({ ...utxoWithOutIndex, index: 60 });
    });

    /**
     * @target UtxoManager.next should return undefined when all elements are returned
     * @dependencies
     * @scenario
     * - create a UtxoManager
     *   - type is number
     *   - serializer will return a pre generated
     *     CardanoUtxo with given input as index
     *   - initial array has 1 elements
     * - run test (call `next` 2 times)
     * - check returned value for each call
     * @expected
     * - first returned value should be array only element
     * - second returned value should be undefined
     */
    it('should return undefined when all elements are returned', async () => {
      const manager = new UtxoManager<number>([2], (num: number) => ({
        ...utxoWithOutIndex,
        index: num * 10,
      }));

      let res = await manager.next();
      expect(res).toEqual({ ...utxoWithOutIndex, index: 20 });
      res = await manager.next();
      expect(res).toBeUndefined();
    });
  });

  describe('extend', () => {
    /**
     * @target UtxoManager.next should return elements before and after extend successfully
     * @dependencies
     * @scenario
     * - create a UtxoManager
     *   - type is number
     *   - serializer will return a pre generated
     *     CardanoUtxo with given input as index
     *   - initial array has 2 elements
     * - run test
     *   - call `next` 3 times
     *   - extend array with two new elements
     *   - call `next` 3 times
     * - check returned value for each call
     * @expected
     * - two calls should return expected elements
     * - next call should return undefined
     * - next two calls should return expected elements
     * - last call should return undefined
     */
    it('should return undefined when all elements are returned', async () => {
      const manager = new UtxoManager<number>([2, 4], (num: number) => ({
        ...utxoWithOutIndex,
        index: num * 10,
      }));

      // call `next` 3 times
      let res = await manager.next();
      expect(res).toEqual({ ...utxoWithOutIndex, index: 20 });
      res = await manager.next();
      expect(res).toEqual({ ...utxoWithOutIndex, index: 40 });
      res = await manager.next();
      expect(res).toBeUndefined();
      // extend array with two new elements
      manager.extend([6, 8]);
      // call `next` 3 times
      res = await manager.next();
      expect(res).toEqual({ ...utxoWithOutIndex, index: 60 });
      res = await manager.next();
      expect(res).toEqual({ ...utxoWithOutIndex, index: 80 });
      res = await manager.next();
      expect(res).toBeUndefined();
    });
  });
});
