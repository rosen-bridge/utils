import { initEccLib } from 'bitcoinjs-lib';
import ecc from '@bitcoinerlab/secp256k1';

initEccLib(ecc);

export * from './encoder';
export * from './decoder';
export * from './types';
export * from './validator';
