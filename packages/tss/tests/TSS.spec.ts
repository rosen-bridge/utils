import { TestTSS } from './TestTSS';
import * as ed from '@noble/ed25519';
import { randomPrivateKey1, randomPrivateKey2 } from './testUtils';
describe('TSS', () => {
  describe('signTss', () => {
    it('Should sign message with eddsa and return sign', async () => {
      const tss = new TestTSS();
      const privateKey = Buffer.from(randomPrivateKey1, 'hex');
      tss.setPrivateKey(Buffer.from(privateKey).toString('hex'));
      const payload = 'payload';
      const hexPayload = Buffer.from(payload, 'utf8').toString('hex');
      const signed = Buffer.from(
        await ed.signAsync(hexPayload, Buffer.from(privateKey).toString('hex'))
      ).toString('hex');
      expect(await tss.getSignTss(hexPayload)).toBe(signed);
    });
  });

  describe('checkTssSign', () => {
    it('Should return true if sign is valid', async () => {
      const tss = new TestTSS();
      const privateKey = Buffer.from(randomPrivateKey1, 'hex');
      tss.setPrivateKey(Buffer.from(privateKey).toString('hex'));
      const payload = 'payload';
      const hexPayload = Buffer.from(payload, 'utf8').toString('hex');
      const sign = await tss.getSignTss(hexPayload);
      const publicKey = Buffer.from(
        await ed.getPublicKeyAsync(privateKey)
      ).toString('hex');
      expect(await tss.getCheckTssSign(hexPayload, sign, publicKey)).toBe(true);
    });

    it('Should return false if sign is invalid', async () => {
      const tss = new TestTSS();
      const privateKey1 = Buffer.from(randomPrivateKey1, 'hex');
      tss.setPrivateKey(Buffer.from(privateKey1).toString('hex'));
      const payload = 'payload';
      const hexPayload = Buffer.from(payload, 'utf8').toString('hex');
      const sign = await tss.getSignTss(hexPayload);
      const privateKey2 = Buffer.from(randomPrivateKey2, 'hex');
      const publicKey2 = Buffer.from(
        await ed.getPublicKeyAsync(privateKey2)
      ).toString('hex');
      expect(await tss.getCheckTssSign(hexPayload, sign, publicKey2)).toBe(
        false
      );
    });
  });
});
