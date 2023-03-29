import * as crypto from 'crypto';
import pkg from 'secp256k1';

import {
  ApprovePayload,
  GuardDetectionConfig,
  GuardInfo,
  HeartbeatPayload,
  Message,
  MessageHandler,
  RegisterPayload,
} from '../lib/types/types';
import { DummyLogger } from '@rosen-bridge/logger-interface';
import { GuardDetection } from '../lib/GuardDetection';
import { describe } from 'node:test';

const guardsPrivateKeys = Array.from({ length: 4 }, () =>
  crypto.randomBytes(32).toString('hex')
);

const guardsPublicKeys = guardsPrivateKeys.map((privateKey) =>
  Buffer.from(
    pkg.publicKeyCreate(Buffer.from(privateKey, 'hex'), false)
  ).toString('hex')
);

const handler: MessageHandler = {
  checkSign: (message, signature) => {
    return signature === 'signature';
  },
  decrypt: (message) => {
    return message;
  },
  encrypt: (message) => {
    return message;
  },
  send: () => {
    return {};
  },
  sign: (message) => {
    return 'signature';
  },
};

const config: GuardDetectionConfig = {
  guardsPublicKey: guardsPublicKeys.slice(1, 4),
  logger: new DummyLogger(),
  publicKey: guardsPublicKeys[0],
};

class mockGuardDetection extends GuardDetection {
  getCheckMessageSign(message: Message) {
    return this.checkMessageSign(message);
  }
  getPublicKeyToIndex(publicKey: string) {
    return this.publicKeyToIndex(publicKey);
  }

  getHandleRegisterMessage(payload: RegisterPayload, sender: string) {
    return this.handleRegisterMessage(payload, sender);
  }

  getHandleApproveMessage(
    payload: ApprovePayload,
    sender: string,
    senderPeerId: string
  ) {
    return this.handleApproveMessage(payload, sender, senderPeerId);
  }

  getHandleHeartbeatMessage(payload: HeartbeatPayload, sender: string) {
    return this.handleHeartbeatMessage(payload, sender);
  }

  getHandleReceivedMessage(message: string, senderPeerId: string) {
    return this.handleReceiveMessage(message, senderPeerId);
  }

  getCheckTimestamp(timestamp: number) {
    return this.checkTimestamp(timestamp);
  }
  runUpdateGuardsStatus() {
    this.updateGuardsStatus();
  }

  setGuardsInfo(info: GuardInfo, index: number) {
    this.guardsInfo[index] = info;
  }

  getGuardInfo(index: number) {
    return this.guardsInfo[index];
  }
}

describe('GuardDetection', () => {
  describe('generateNounce', () => {
    it('should generate a random nounce with the default size 32', () => {
      const guardDetection = new GuardDetection(handler, config);
      const guardDetectionProto = Object.getPrototypeOf(guardDetection);
      const nounce = guardDetectionProto.generateNounce();
      expect(nounce).toHaveLength(44);
      console.log(guardsPublicKeys);
    });

    it('should generate a random nounce with the given size', () => {
      const guardDetection = new GuardDetection(handler, config);
      const guardDetectionProto = Object.getPrototypeOf(guardDetection);
      const nounce = guardDetectionProto.generateNounce(10);
      expect(nounce).toHaveLength(16);
    });
  });

  describe('checkMessageSign', () => {
    it('should return true if the message is valid', () => {
      const guardDetection = new mockGuardDetection(handler, config);
      const payload = 'payload';
      const parsedMessage: Message = {
        type: 'approve',
        pk: guardsPublicKeys[1],
        payload: 'payload',
        signature: 'signature',
        receiver: 'receiver',
      };
      const isValid = guardDetection.getCheckMessageSign(parsedMessage);
      expect(isValid).toBeTruthy();
    });

    it('should return false if the message is not valid', () => {
      const guardDetection = new mockGuardDetection(handler, config);
      const parsedMessage: Message = {
        type: 'approve',
        pk: guardsPublicKeys[1],
        payload: 'payload',
        signature: 'not valid signature',
        receiver: 'receiver',
      };
      const isValid = guardDetection.getCheckMessageSign(parsedMessage);
      expect(isValid).toBeFalsy();
    });
  });

  describe('checkTimestamp', () => {
    it('should return true if the timestamp is valid', () => {
      const guardDetection = new mockGuardDetection(handler, config);
      const isValid = guardDetection.getCheckTimestamp(Date.now());
      expect(isValid).toBeTruthy();
    });

    it('should return false if the timestamp is not valid', () => {
      const guardDetection = new mockGuardDetection(handler, config);
      const isValid = guardDetection.getCheckTimestamp(
        Date.now() - 2 * 60 * 1000
      );
      expect(isValid).toBeFalsy();
    });
  });

  describe('publicKeyToIndex', () => {
    it('should return the index of the public key', () => {
      const guardDetection = new mockGuardDetection(handler, config);
      const index = guardDetection.getPublicKeyToIndex(guardsPublicKeys[1]);
      expect(index).toEqual(0);
    });
    it('should return -1 if the public key is not in the list', () => {
      const guardDetection = new mockGuardDetection(handler, config);
      const index = guardDetection.getPublicKeyToIndex('publicKey');
      expect(index).toEqual(-1);
    });
  });

  describe('handleRegisterMessage', () => {
    it('should send an approve message with the new nounce and the received nounce', () => {
      jest.spyOn(handler, 'send');
      const guardDetection = new mockGuardDetection(handler, config);
      jest
        .spyOn(Object.getPrototypeOf(guardDetection), 'generateNounce')
        .mockReturnValue('new nounce');
      const payload: RegisterPayload = {
        nounce: 'nounce',
        timestamp: Date.now(),
      };
      guardDetection.getHandleRegisterMessage(payload, guardsPublicKeys[1]);
      expect(handler.send).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'approve',
          pk: guardsPublicKeys[0],
          payload: expect.stringContaining(
            '{"nounce":"new nounce","receivedNounce":"nounce","timestamp":'
          ),
          signature: 'signature',
          receiver: guardsPublicKeys[1],
        })
      );
    });
  });

  describe('handleApproveMessage', () => {
    it('should save peerId in case of received nounce is equal to sender nounce and lastUpdate is less than guardsHeartbeatTimeout', () => {
      jest.spyOn(handler, 'send').mockClear();
      jest.spyOn(handler, 'send');
      const guardDetection = new mockGuardDetection(handler, config);
      const lastUpdate = Date.now() - 20 * 1000;
      guardDetection.setGuardsInfo(
        { nounce: 'nounce', lastUpdate: lastUpdate, peerId: '' },
        0
      );
      const payload: ApprovePayload = {
        receivedNounce: 'nounce',
        timestamp: Date.now(),
      };
      guardDetection.getHandleApproveMessage(
        payload,
        guardsPublicKeys[1],
        'peerId'
      );
      expect(guardDetection.getGuardInfo(0).peerId).toEqual('peerId');
      expect(guardDetection.getGuardInfo(0).lastUpdate).toBeGreaterThan(
        lastUpdate
      );
      expect(handler.send).not.toHaveBeenCalled();
    });

    it('should send approve message if nounce is set in the payload and received nounce is equal to sender nounce', () => {
      jest.spyOn(handler, 'send').mockClear();
      jest.spyOn(handler, 'send');
      const guardDetection = new mockGuardDetection(handler, config);
      guardDetection.setGuardsInfo(
        { nounce: 'nounce', lastUpdate: 0, peerId: '' },
        0
      );
      const payload: ApprovePayload = {
        nounce: 'new nounce',
        receivedNounce: 'nounce',
        timestamp: Date.now(),
      };
      guardDetection.getHandleApproveMessage(
        payload,
        guardsPublicKeys[1],
        'peerId'
      );
      expect(guardDetection.getGuardInfo(0).nounce).toEqual('nounce');
      expect(guardDetection.getGuardInfo(0).peerId).toEqual('');
      expect(handler.send).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'approve',
          pk: guardsPublicKeys[0],
          payload: expect.stringContaining(
            '{"receivedNounce":"new nounce","timestamp"'
          ),
          signature: 'signature',
          receiver: guardsPublicKeys[1],
        })
      );
    });
  });

  describe('handleHeartbeatMessage', () => {
    it('should send approve message just with the received nounce', () => {
      jest.spyOn(handler, 'send').mockClear();
      jest.spyOn(handler, 'send');
      const guardDetection = new mockGuardDetection(handler, config);
      const payload: HeartbeatPayload = {
        nounce: 'nounce',
        timestamp: Date.now(),
      };
      guardDetection.getHandleHeartbeatMessage(payload, guardsPublicKeys[1]);
      expect(handler.send).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'approve',
          pk: guardsPublicKeys[0],
          payload: expect.stringContaining(
            '{"receivedNounce":"nounce","timestamp"'
          ),
          signature: 'signature',
          receiver: guardsPublicKeys[1],
        })
      );
    });
  });

  describe('handleReceiveMessage', () => {
    it('should call the correct handler for the message register with correct signature', () => {
      const guardDetection = new mockGuardDetection(handler, config);
      const spiedHandleRegister = jest.spyOn(
        Object.getPrototypeOf(guardDetection),
        'handleRegisterMessage'
      );
      const parsedMessage: Message = {
        type: 'register',
        pk: guardsPublicKeys[1],
        payload: JSON.stringify({ nounce: 'nounce', timestamp: Date.now() }),
        signature: 'signature',
        receiver: 'receiver',
      };
      guardDetection.getHandleReceivedMessage(
        JSON.stringify(parsedMessage),
        'peerId'
      );
      expect(spiedHandleRegister).toHaveBeenCalled();
      spiedHandleRegister.mockClear();
    });

    it('should call the correct handler for the message approve with correct signature', () => {
      const guardDetection = new mockGuardDetection(handler, config);
      const spiedHandleApprove = jest.spyOn(
        Object.getPrototypeOf(guardDetection),
        'handleApproveMessage'
      );
      const parsedMessage: Message = {
        type: 'approve',
        pk: guardsPublicKeys[1],
        payload: JSON.stringify({
          nounce: 'nounce',
          receivedNounce: 'nounce',
          timestamp: Date.now(),
        }),
        signature: 'signature',
        receiver: 'receiver',
      };
      guardDetection.getHandleReceivedMessage(
        JSON.stringify(parsedMessage),
        'peerId'
      );
      expect(spiedHandleApprove).toHaveBeenCalled();
      spiedHandleApprove.mockClear();
    });

    it('should call the correct handler for the message heartbeat with correct signature', () => {
      const guardDetection = new mockGuardDetection(handler, config);
      const spiedHandleHeartbeat = jest.spyOn(
        Object.getPrototypeOf(guardDetection),
        'handleHeartbeatMessage'
      );
      const parsedMessage: Message = {
        type: 'heartbeat',
        pk: guardsPublicKeys[1],
        payload: JSON.stringify({ nounce: 'nounce', timestamp: Date.now() }),
        signature: 'signature',
        receiver: 'receiver',
      };
      guardDetection.getHandleReceivedMessage(
        JSON.stringify(parsedMessage),
        'peerId'
      );
      expect(spiedHandleHeartbeat).toHaveBeenCalled();
      spiedHandleHeartbeat.mockClear();
    });

    it('should not call any handler if the signature is not correct', () => {
      const guardDetection = new mockGuardDetection(handler, config);
      const spiedHandleHeartbeat = jest.spyOn(
        Object.getPrototypeOf(guardDetection),
        'handleHeartbeatMessage'
      );
      const spiedHandleApprove = jest.spyOn(
        Object.getPrototypeOf(guardDetection),
        'handleApproveMessage'
      );
      const spiedHandleRegister = jest.spyOn(
        Object.getPrototypeOf(guardDetection),
        'handleRegisterMessage'
      );
      const parsedMessage: Message = {
        type: 'heartbeat',
        pk: guardsPublicKeys[1],
        payload: JSON.stringify({ nounce: 'nounce' }),
        signature: 'wrong signature',
        receiver: 'receiver',
      };
      guardDetection.getHandleReceivedMessage(
        JSON.stringify(parsedMessage),
        'peerId'
      );
      expect(spiedHandleHeartbeat).not.toHaveBeenCalled();
      expect(spiedHandleApprove).not.toHaveBeenCalled();
      expect(spiedHandleRegister).not.toHaveBeenCalled();
    });

    it('should not call any handler if timestamp is not valid', () => {
      const guardDetection = new mockGuardDetection(handler, config);
      const spiedHandleHeartbeat = jest.spyOn(
        Object.getPrototypeOf(guardDetection),
        'handleHeartbeatMessage'
      );
      const spiedHandleApprove = jest.spyOn(
        Object.getPrototypeOf(guardDetection),
        'handleApproveMessage'
      );
      const spiedHandleRegister = jest.spyOn(
        Object.getPrototypeOf(guardDetection),
        'handleRegisterMessage'
      );
      const parsedMessage: Message = {
        type: 'heartbeat',
        pk: guardsPublicKeys[1],
        payload: JSON.stringify({
          nounce: 'nounce',
          timestamp: Date.now() - 4 * 60 * 1000,
        }),
        signature: 'signature',
        receiver: 'receiver',
      };
      guardDetection.getHandleReceivedMessage(
        JSON.stringify(parsedMessage),
        'peerId'
      );
      expect(spiedHandleHeartbeat).not.toHaveBeenCalled();
      expect(spiedHandleApprove).not.toHaveBeenCalled();
      expect(spiedHandleRegister).not.toHaveBeenCalled();
    });
  });

  describe('getActiveGuards', () => {
    it('should return the active guards', () => {
      const guardDetection = new mockGuardDetection(handler, config);
      guardDetection.setGuardsInfo(
        { nounce: 'nounce', lastUpdate: Date.now(), peerId: '' },
        0
      );
      guardDetection.setGuardsInfo(
        {
          nounce: 'nounce',
          lastUpdate: Date.now() - 3 * 60 * 1000,
          peerId: 'peerId1',
        },
        1
      );
      guardDetection.setGuardsInfo(
        {
          nounce: 'nounce',
          lastUpdate: Date.now() - 50 * 1000,
          peerId: 'peerId2',
        },
        2
      );
      expect(guardDetection.getActiveGuards()).toEqual(['peerId2']);
    });
  });

  describe('updateGuardsStatus', () => {
    it('should send register message to guards that passed register timeout', () => {
      const guardDetection = new mockGuardDetection(handler, config);
      jest
        .spyOn(Object.getPrototypeOf(guardDetection), 'generateNounce')
        .mockReturnValue('new nounce');
      jest.spyOn(handler, 'send').mockClear();
      guardDetection.setGuardsInfo(
        { nounce: 'nounce', lastUpdate: Date.now(), peerId: 'peerId' },
        0
      );
      guardDetection.setGuardsInfo(
        {
          nounce: 'nounce',
          lastUpdate: Date.now() - 3 * 60 * 1000,
          peerId: 'peerId1',
        },
        1
      );
      guardDetection.setGuardsInfo(
        {
          nounce: 'nounce',
          lastUpdate: Date.now() - 55 * 1000,
          peerId: 'peerId2',
        },
        2
      );
      guardDetection.runUpdateGuardsStatus();

      expect(handler.send).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'register',
          pk: guardsPublicKeys[0],
          payload: expect.stringContaining(
            '{"nounce":"new nounce","timestamp"'
          ),
          signature: 'signature',
          receiver: guardsPublicKeys[2],
        })
      );
    });
    it('should send heartbeat message to guards that passed heartbeat timeout', () => {
      const guardDetection = new mockGuardDetection(handler, config);
      jest
        .spyOn(Object.getPrototypeOf(guardDetection), 'generateNounce')
        .mockReturnValue('new nounce');
      jest.spyOn(handler, 'send').mockClear();
      guardDetection.setGuardsInfo(
        { nounce: 'nounce', lastUpdate: Date.now(), peerId: 'peerId' },
        0
      );
      guardDetection.setGuardsInfo(
        {
          nounce: 'nounce',
          lastUpdate: Date.now() - 61 * 1000,
          peerId: 'peerId1',
        },
        1
      );
      guardDetection.setGuardsInfo(
        {
          nounce: 'nounce',
          lastUpdate: Date.now() - 55 * 1000,
          peerId: 'peerId2',
        },
        2
      );
      guardDetection.runUpdateGuardsStatus();
      expect(handler.send).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'heartbeat',
          pk: guardsPublicKeys[0],
          payload: expect.stringContaining(
            '{"nounce":"new nounce","timestamp"'
          ),
          signature: 'signature',
          receiver: guardsPublicKeys[2],
        })
      );
    });
  });
});
