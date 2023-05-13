import { TestTSS } from './TestTSS';
import * as ed from '@noble/ed25519';
describe('TSS', () => {
  describe('signTss', () => {
    it('Should sign message with ecdsa and return sign', async () => {
      const tss = new TestTSS();
      const privateKey = ed.utils.randomPrivateKey();
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
      const privateKey = ed.utils.randomPrivateKey();
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
      const privateKey1 = ed.utils.randomPrivateKey();
      tss.setPrivateKey(Buffer.from(privateKey1).toString('hex'));
      const payload = 'payload';
      const hexPayload = Buffer.from(payload, 'utf8').toString('hex');
      const sign = await tss.getSignTss(hexPayload);
      const privateKey2 = ed.utils.randomPrivateKey();
      const publicKey2 = Buffer.from(
        await ed.getPublicKeyAsync(privateKey2)
      ).toString('hex');
      expect(await tss.getCheckTssSign(hexPayload, sign, publicKey2)).toBe(
        false
      );
    });
  });
});
