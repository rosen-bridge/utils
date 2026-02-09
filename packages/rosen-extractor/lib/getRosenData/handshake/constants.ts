export const HANDSHAKE_NETWORK = {
  messagePrefix: '\x18Handshake Signed Message:\n',
  bech32: 'hs',
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4,
  },
  pubKeyHash: -1,
  scriptHash: -1,
  wif: -1,
};

export const MIN_UTXO_VALUE = 1000;