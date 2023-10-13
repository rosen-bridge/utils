import { UtxoManager } from '../lib';

describe('UtxoManager', () => {
  describe('next', () => {
    const mockedUtxo = {
      txId: '6699c2b892da307f8e3bf9329e9b17b397a7aff525f4caa8d05507b73a8392b5',
      address: 'address',
      value: 3000000n,
      assets: [
        {
          policyId: '10bb8374ec0e933f80a684dd32363151cb6051864afb0b0088bba207',
          assetName: '727074',
          quantity: 150n,
        },
        {
          policyId: 'bb8374ec0e933f80a684dd32363151cb6051864afb0b0088bba20710',
          assetName: '72707476',
          quantity: 200n,
        },
      ],
    };

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
        ...mockedUtxo,
        index: num * 10,
      }));

      let res = await manager.next();
      expect(res).toEqual({ ...mockedUtxo, index: 20 });
      res = await manager.next();
      expect(res).toEqual({ ...mockedUtxo, index: 40 });
      res = await manager.next();
      expect(res).toEqual({ ...mockedUtxo, index: 60 });
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
        ...mockedUtxo,
        index: num * 10,
      }));

      let res = await manager.next();
      expect(res).toEqual({ ...mockedUtxo, index: 20 });
      res = await manager.next();
      expect(res).toBeUndefined();
    });
  });
});
