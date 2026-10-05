/** Public 20-byte hash from the official CashAddr translation vector. */
export const hash = '76a04053bda0a88bda5177b86a15c3b29f559873';

// Official CashAddr translation and larger-payload vectors:
// https://github.com/bitcoincashorg/bitcoincash.org/blob/master/spec/cashaddr.md
/** Official address and locking-script pairs used by each native codec function. */
export const vectors = [
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
