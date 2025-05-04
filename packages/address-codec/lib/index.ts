import * as tinySecp from 'tiny-secp256k1';
import * as bitcoinLib from 'bitcoinjs-lib';

bitcoinLib.initEccLib(tinySecp);

export * from './encoder';
export * from './decoder';
export * from './types';
export * from './validator';
