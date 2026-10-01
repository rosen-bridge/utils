import {
  CashAddressType,
  encodeCashAddress,
  encodeCashAddressNonStandard,
  encodeCashAddressFormat,
} from '@bitauth/libauth';

import {
  UnsupportedAddressError,
  decodeBitcoinCashAddress,
  encodeBitcoinCashAddress,
  validateBitcoinCashAddress,
} from '../lib';

const hash = '76a04053bda0a88bda5177b86a15c3b29f559873';
// Official CashAddr translation and larger-payload vectors:
// https://github.com/bitcoincashorg/bitcoincash.org/blob/master/spec/cashaddr.md
const vectors = [
  [
    'bitcoincash:qpm2qsznhks23z7629mms6s4cwef74vcwvy22gdx6a',
    `76a914${hash}88ac`,
  ],
  ['bitcoincash:ppm2qsznhks23z7629mms6s4cwef74vcwvn0h829pq', `a914${hash}87`],
  [
    'bitcoincash:qr6m7j9njldwwzlg9v7v53unlr4jkmx6eylep8ekg2',
    '76a914f5bf48b397dae70be82b3cca4793f8eb2b6cdac988ac',
  ],
];

describe('native Bitcoin Cash mainnet codec', () => {
  it.each(vectors)('round trips official vector %s', (address, script) => {
    expect(encodeBitcoinCashAddress(address)).toBe(script);
    expect(decodeBitcoinCashAddress(script)).toBe(address);
    expect(() => validateBitcoinCashAddress(address)).not.toThrow();
  });

  it.each(vectors)('canonicalizes uppercase address %s', (address, script) => {
    expect(encodeBitcoinCashAddress(address.toUpperCase())).toBe(script);
    expect(decodeBitcoinCashAddress(script.toUpperCase())).toBe(address);
    expect(() =>
      validateBitcoinCashAddress(address.toUpperCase()),
    ).not.toThrow();
  });

  const makeAddress = (
    type: CashAddressType,
    prefix: 'bitcoincash' | 'bchtest' | 'bchreg' = 'bitcoincash',
    size = 20,
  ) =>
    encodeCashAddress({ type, prefix, payload: new Uint8Array(size) }).address;

  const invalidAddresses = [
    ['short input', vectors[0][0].slice(0, -1)],
    ['long input', vectors[0][0] + 'q'],
    ['huge input', 'bitcoincash:' + 'q'.repeat(1_000_000)],
    ['mixed case', vectors[0][0].replace('qpm', 'Qpm')],
    ['prefixless', vectors[0][0].split(':')[1]],
    ['legacy Base58', '1BpEi6DfDAUFd7GtittLSdBeYJvcoaVggu'],
    ['testnet', makeAddress(CashAddressType.p2pkh, 'bchtest')],
    ['regtest', makeAddress(CashAddressType.p2pkh, 'bchreg')],
    ['token P2PKH intent', makeAddress(CashAddressType.p2pkhWithTokens)],
    ['token P2SH intent', makeAddress(CashAddressType.p2shWithTokens)],
    ['P2SH32', makeAddress(CashAddressType.p2sh, 'bitcoincash', 32)],
    [
      '24-byte hash',
      'bitcoincash:q9adhakpwzztepkpwp5z0dq62m6u5v5xtyj7j3h2ws4mr9g0',
    ],
    ['checksum', vectors[0][0].slice(0, -1) + 'q'],
    ['double prefix', 'bitcoincash:' + vectors[0][0]],
    ['whitespace', vectors[0][0] + ' '],
    ['SegWit', 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kygt080'],
    [
      'unknown type',
      encodeCashAddressNonStandard({
        prefix: 'bitcoincash',
        typeBits: 4,
        payload: new Uint8Array(20),
      }).address,
    ],
    [
      'reserved version bit',
      encodeCashAddressFormat({
        prefix: 'bitcoincash',
        version: 128,
        payload: new Uint8Array(20),
      }).address,
    ],
  ];
  it.each(invalidAddresses)('rejects %s', (_, address) => {
    expect(() => encodeBitcoinCashAddress(address)).toThrow(
      UnsupportedAddressError,
    );
    expect(() => validateBitcoinCashAddress(address)).toThrow(
      UnsupportedAddressError,
    );
  });

  const invalidScripts = [
    ['empty', ''],
    ['odd hex', vectors[0][1].slice(1)],
    ['nonhex', vectors[0][1].replace('76', 'zz')],
    ['space', vectors[0][1] + ' '],
    ['0x prefix', '0x' + vectors[0][1]],
    ['over 60 bytes', '00'.repeat(61)],
    ['60-byte unsupported script', '00'.repeat(60)],
    ['truncated hash', `76a914${hash.slice(2)}88ac`],
    ['trailing opcode', vectors[0][1] + '00'],
    ['nonminimal PUSHDATA1', `76a94c14${hash}88ac`],
    ['wrong terminal opcode', `76a914${hash}88ad`],
    ['SegWit script', `0014${hash}`],
    ['P2SH32 script', `aa20${'00'.repeat(32)}87`],
    ['token prefix', `ef${vectors[0][1]}`],
  ];
  it.each(invalidScripts)('rejects script %s', (_, script) => {
    expect(() => decodeBitcoinCashAddress(script)).toThrow(
      UnsupportedAddressError,
    );
  });

  it('bounds diagnostics for oversized script input', () => {
    const script = '00'.repeat(500_000);
    try {
      decodeBitcoinCashAddress(script);
      expect.fail('oversized script was accepted');
    } catch (error) {
      expect(error).toBeInstanceOf(UnsupportedAddressError);
      const message = (error as Error).message;
      expect(message).toContain('1000000 characters');
      expect(message.length).toBeLessThan(256);
    }
  });
});
