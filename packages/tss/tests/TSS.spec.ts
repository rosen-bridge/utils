import { describe } from 'node:test';
import { guardsPublicKeys } from './testUtils';
import { TestTSS } from './TestTSS';
// import * as ed from '@noble/ed25519';

describe('TSS', () => {
  // describe('signTss', () => {
  //   it('Should sign message with ecdsa and return sign', () => {
  //     const tss = new TestTSS();
  //     const payload = 'payload';
  //     const signed= Buffer.from(ed.sign(Uint8Array.from(Buffer.from(payload, 'hex')), Uint8Array.from(Buffer.from(tss.getPrivateKey(), 'hex')))).toString('hex');
  //
  //     const res = Buffer.from(signed).toString('hex');
  //     expect(tss.getSignTss(payload)).toBe(res);
  //   });
  // });

  describe('checkTssSign', () => {
    it('Should return true if sign is valid', () => {
      const tss = new TestTSS();
      const payload = 'payload';
      const sign = tss.getSignTss(payload);
      expect(tss.getCheckTssSign(payload, sign, guardsPublicKeys[0])).toBe(
        true
      );
    });

    it('Should return false if sign is invalid', () => {
      const tss = new TestTSS();
      const payload = 'payload';
      const sign = tss.getSignTss(payload);
      expect(tss.getCheckTssSign(payload, sign, guardsPublicKeys[1])).toBe(
        false
      );
    });
  });
});
