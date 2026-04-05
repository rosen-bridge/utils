import ecc from '@bitcoinerlab/secp256k1';
import { initEccLib } from 'bitcoinjs-lib';

initEccLib(ecc);

export * from './handshake';
export * from './const';
export * from './types';
