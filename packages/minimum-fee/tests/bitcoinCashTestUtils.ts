import { MinimumFeeBox } from '../lib/minimumFeeBox';

/**
 * Fetch a synthetic fee box whose decoded R4 source names can be faulted.
 * @param chains - Ordered source chain names; defaults to BCH and Ergo
 * @returns A populated fee reader with independent chain/height rows
 */
export const bitcoinCashFeeBox = async (
  chains = ['bitcoin-cash', 'ergo'],
): Promise<MinimumFeeBox> => {
  const tokenId = '56'.repeat(32);
  const registers = {
    R4: chains.map((chain) => [...Buffer.from(chain)]),
    R5: [
      [100, 200],
      [150, 300],
    ],
    R6: [
      ['31', '11'],
      ['32', '12'],
    ],
    R7: [
      ['41', '21'],
      ['42', '22'],
    ],
    R8: [
      [
        ['1', '100'],
        ['2', '100'],
      ],
      [
        ['3', '100'],
        ['4', '100'],
      ],
    ],
    R9: [
      ['0', '0'],
      ['0', '0'],
    ],
  };
  const box = {
    boxId: 'fee-box',
    assets: [{ tokenId: 'nft' }, { tokenId }],
    additionalRegisters: Object.fromEntries(
      Object.entries(registers).map(([key, value]) => [
        key,
        JSON.stringify(value),
      ]),
    ),
  };
  const fees = new MinimumFeeBox(
    tokenId,
    'nft',
    {
      /** Return only the synthetic fee box without external requests. */
      getBoxesByTokenId: async () => [box],
    } as unknown as ConstructorParameters<typeof MinimumFeeBox>[2],
    JSON.parse,
  );
  expect(await fees.fetchBox()).toEqual(true);
  return fees;
};
