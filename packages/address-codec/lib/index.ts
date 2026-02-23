import ecc from '@bitcoinerlab/secp256k1';
import { initEccLib } from 'bitcoinjs-lib';

initEccLib(ecc);

export * from './encoder';
export * from './decoder';
export * from './types';
export * from './validator';
