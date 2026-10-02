import {
  bitcoinCashValueToSatoshis,
  decodeBitcoinCashOpReturnPayload,
  parseBitcoinCashOpReturn,
} from '../../../lib/getRosenData/bitcoin-cash/utils';

/** Encode a canonical OP_RETURN push without interpreting its receiver. */
const push = (data: Buffer): string =>
  `6a${data.length <= 75 ? data.length.toString(16).padStart(2, '0') : `4c${data.length.toString(16)}`}${data.toString('hex')}`;

describe('decodeBitcoinCashOpReturnPayload', () => {
  /**
   * @target decodeBitcoinCashOpReturnPayload
   * @dependencies raw canonical push fixtures
   * @scenario frame75,76 and80bytes including an assigned Ergo destination code
   * @expected exact payload bytes are recovered independently of receiver parsing
   */
  it.each([75, 76, 80])('accepts canonical framing of%i bytes', (length) => {
    const data = Buffer.concat([
      Buffer.alloc(17),
      Buffer.of(length - 18),
      Buffer.alloc(length - 18, 0x51),
    ]);
    expect(decodeBitcoinCashOpReturnPayload(push(data))).toEqual(data);
  });

  /**
   * @target decodeBitcoinCashOpReturnPayload
   * @dependencies malformed opcode and nonminimal PUSHDATA1 fixtures
   * @scenario decode opcode76 without its length and PUSHDATA1 for75bytes
   * @expected both noncanonical push forms are rejected
   */
  it('rejects ambiguous and nonminimal pushes', () => {
    expect(() =>
      decodeBitcoinCashOpReturnPayload('6a4c' + '51'.repeat(76)),
    ).toThrow();
    expect(() =>
      decodeBitcoinCashOpReturnPayload('6a4c4b' + '51'.repeat(75)),
    ).toThrow();
  });
});

describe('parseBitcoinCashOpReturn', () => {
  /**
   * @target parseBitcoinCashOpReturn
   * @dependencies canonical framing and the real Ergo address decoder
   * @scenario supply valid framing with malformed receiver bytes at75,76,80bytes
   * @expected rejection occurs at receiver decoding after successful framing
   */
  it.each([75, 76, 80])(
    'rejects the malformed Ergo receiver at%i bytes',
    (length) => {
      const data = Buffer.concat([
        Buffer.alloc(17),
        Buffer.of(length - 18),
        Buffer.alloc(length - 18, 0x51),
      ]);
      expect(() => parseBitcoinCashOpReturn(push(data))).toThrow(
        /Scorex parsing|noncanonical|unsupported/i,
      );
    },
  );

  /**
   * @target parseBitcoinCashOpReturn
   * @dependencies isolated malformed push fixtures
   * @scenario parse empty,truncated,nonminimal,multiple,nonhex or oversized pushes
   * @expected every input is rejected before Rosen data can be returned
   */
  it.each([
    '6a',
    '6a01',
    '6a010051',
    '6a4d010051',
    '6a4c0151',
    '6a4c50',
    '6azz',
    push(Buffer.alloc(81)),
    '6a' + '00'.repeat(84),
  ])('rejects malformed framing%s', (hex) => {
    expect(() => parseBitcoinCashOpReturn(hex)).toThrow();
  });
});

describe('bitcoinCashValueToSatoshis', () => {
  /**
   * @target bitcoinCashValueToSatoshis
   * @dependencies real decimal conversion without Number aggregation
   * @scenario parse one satoshi in exponent notation and uint64 plus one
   * @expected the satoshi is exact and the amount beyond uint64 is rejected
   */
  it('preserves one satoshi and rejects uint64 overflow', () => {
    expect(bitcoinCashValueToSatoshis(1e-8)).toEqual(1n);
    expect(() => bitcoinCashValueToSatoshis('184467440737.09551616')).toThrow();
  });
});
