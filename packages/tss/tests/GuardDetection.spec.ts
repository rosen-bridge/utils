import {
  ApprovePayload,
  HeartbeatPayload,
  Message,
  RegisterPayload,
} from '../lib/types/types';
import { GuardDetection } from '../lib/GuardDetection';
import { describe } from 'node:test';
import {
  config,
  guardsPublicKeys,
  handler,
  mockGuardDetection,
} from './mock/guardDetection.mock';

describe('GuardDetection', () => {
  describe('generateNonce', () => {
    /**
     * @target
     * `generateNonce` Should generate a random base64 encoded nonce with the default size 32
     * @dependencies
     *  - crypto library
     * @scenario
     * - calling `generateNonce` without a size parameter and check
     *  the length of the nonce should be 44 in base64
     * @expected
     * - the length of the nonce should be 44 in base64
     */
    it('Should generate a random base64 encoded nonce with the default size 32', () => {
      const guardDetection = new GuardDetection(handler, config);
      const guardDetectionProto = Object.getPrototypeOf(guardDetection);
      const nonce = guardDetectionProto.generateNonce();
      expect(nonce).toHaveLength(44);
    });

    /**
     * @target
     * `generateNonce` Should generate a random base64 encoded nonce with the given size
     * @dependencies
     * - crypto library
     * @scenario
     * - calling `generateNonce` with a size parameter and check
     * the length of the nonce should be 16 in base64
     * @expected
     * - the length of the nonce should be 16 in base64
     */
    it('Should generate a random base64 encoded nonce with the given size', () => {
      const guardDetection = new GuardDetection(handler, config);
      const guardDetectionProto = Object.getPrototypeOf(guardDetection);
      const nonce = guardDetectionProto.generateNonce(10);
      expect(nonce).toHaveLength(16);
    });
  });

  describe('checkMessageSign', () => {
    /**
     * @target
     * `checkMessageSign` Should return true if the message have a valid signature
     *   and public key is in the approved public keys
     * @dependencies
     * @scenario
     * - calling `checkMessageSign` with a valid message and check the return value
     * @expected
     * - the return value should be true
     */
    it(
      'Should return true if public key of sender' +
        ' be in the valid public keys and message signature should be true',
      () => {
        const guardDetection = new mockGuardDetection(handler, config);
        const parsedMessage: Message = {
          type: 'approve',
          pk: guardsPublicKeys[1],
          payload: 'payload',
          signature: 'signature',
          receiver: 'receiver',
        };
        const isValid = guardDetection.getCheckMessageSign(parsedMessage);
        expect(isValid).toBeTruthy();
      }
    );

    /**
     * @target
     * `checkMessageSign` Should return false if the message have not a valid signature
     * @dependencies
     * @scenario
     * - calling `checkMessageSign` with a message with not valid signature and check the return value
     * @expected
     * - the return value should be false
     */
    it('Should return false if the message is not have valid signature', () => {
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

    /**
     * @target
     * `checkMessageSign` Should return false if the message have not a valid public key
     * @dependencies
     * @scenario
     * - calling `checkMessageSign` with a message with not valid public key and check the return value
     * @expected
     * - the return value should be false
     */
    it('Should return false if the message have not a valid public key', () => {
      const guardDetection = new mockGuardDetection(handler, config);
      const parsedMessage: Message = {
        type: 'approve',
        pk: 'not valid public key',
        payload: 'payload',
        signature: 'signature',
        receiver: 'receiver',
      };
      const isValid = guardDetection.getCheckMessageSign(parsedMessage);
      expect(isValid).toBeFalsy();
    });
  });

  describe('checkTimestamp', () => {
    /**
     * @target
     * `checkTimestamp` Should return true if the timestamp is less than timestampTolerance
     * @dependencies
     * - Date library
     * @scenario
     * - calling `checkTimestamp` with a timestamp less than timestampTolerance and check the return value
     * @expected
     * - the return value should be true
     */
    it('Should return true if the timestamp is less than timestampTolerance', () => {
      const guardDetection = new mockGuardDetection(handler, config);
      const isValid = guardDetection.getCheckTimestamp(Date.now());
      expect(isValid).toBeTruthy();
    });

    /**
     * @target
     * `checkTimestamp` Should return false if the timestamp is not less than timestampTolerance
     * @dependencies
     * - Date library
     * @scenario
     * - calling `checkTimestamp` with a timestamp not less than timestampTolerance and check the return value
     * @expected
     * - the return value should be false
     */
    it('Should return false if the timestamp is not less than timestampTolerance', () => {
      const guardDetection = new mockGuardDetection(handler, config);
      const isValid = guardDetection.getCheckTimestamp(
        Date.now() - 2 * 60 * 1000
      );
      expect(isValid).toBeFalsy();
    });
  });

  describe('publicKeyToIndex', () => {
    /**
     * @target
     * `publicKeyToIndex` Should return the index of the public key
     * @dependencies
     * @scenario
     * - calling `publicKeyToIndex` with a valid public key and check the return value
     * @expected
     * - the return value should be the index of the public key
     */
    it('Should return the index of the public key', () => {
      const guardDetection = new mockGuardDetection(handler, config);
      guardDetection.setGuardsInfo(
        {
          publicKey: guardsPublicKeys[1],
          nonce: 'nonce',
          lastUpdate: Date.now(),
          peerId: 'peerId',
        },
        0
      );

      guardDetection.setGuardsInfo(
        {
          publicKey: guardsPublicKeys[2],
          nonce: 'nonce',
          lastUpdate: Date.now(),
          peerId: 'peerId',
        },
        1
      );

      guardDetection.setGuardsInfo(
        {
          publicKey: guardsPublicKeys[3],
          nonce: 'nonce',
          lastUpdate: Date.now(),
          peerId: 'peerId',
        },
        2
      );

      const index = guardDetection.getPublicKeyToIndex(guardsPublicKeys[1]);
      expect(index).toEqual(0);
    });

    /**
     * @target
     * `publicKeyToIndex` Should return -1 if the public key is not in the list
     * @dependencies
     * @scenario
     * - calling `publicKeyToIndex` with a not valid public key and check the return value
     * @expected
     * - the return value should be -1
     */
    it('Should return -1 if the public key is not in the list', () => {
      const guardDetection = new mockGuardDetection(handler, config);
      const index = guardDetection.getPublicKeyToIndex('publicKey');
      expect(index).toEqual(-1);
    });
  });

  describe('handleRegisterMessage', () => {
    /**
     * @target
     * `handleRegisterMessage` Should send an approve message with the new
     *   nonce and the received nonce
     * @dependencies
     * - `generateNonce`
     * - `send`
     * - Date library
     * @scenario
     * - calling `handleRegisterMessage` with a valid message and check the sent message
     * @expected
     * - The sent message should be an approve message with the new nonce and the received nonce
     */
    it('Should send an approve message with the new nonce and the received nonce', async () => {
      jest.spyOn(handler, 'send');
      const guardDetection = new mockGuardDetection(handler, config);
      jest
        .spyOn(Object.getPrototypeOf(guardDetection), 'generateNonce')
        .mockReturnValue('new nonce');
      const payload: RegisterPayload = {
        nonce: 'nonce',
        timestamp: Date.now(),
      };
      await guardDetection.getHandleRegisterMessage(
        payload,
        guardsPublicKeys[1]
      );
      expect(handler.send).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'approve',
          pk: guardsPublicKeys[0],
          payload: expect.stringContaining(
            '{"nonce":"new nonce","receivedNonce":"nonce","timestamp":'
          ),
          signature: 'signature',
          receiver: guardsPublicKeys[1],
        })
      );
    });
  });

  describe('handleApproveMessage', () => {
    /**
     * @target
     * `handleApproveMessage` Should save peerId in case of received nonce is
     *  equal to sender nonce and lastUpdate is less than guardsHeartbeatTimeout
     * @dependencies
     * - Date library
     * - `send`
     * @scenario
     * - calling `handleApproveMessage` with a valid message and check the saved peerId
     *  and lastUpdate and the sent message
     * @expected
     * - the saved peerId should be the received peerId and the lastUpdate should be
     *  greater than the lastUpdate before calling `handleApproveMessage`
     */
    it(
      'Should save peerId in case of received nonce is equal to sender nonce' +
        ' and lastUpdate is less than guardsHeartbeatTimeout',
      async () => {
        jest.spyOn(handler, 'send').mockClear();
        jest.spyOn(handler, 'send');
        const guardDetection = new mockGuardDetection(handler, config);
        const lastUpdate = Date.now() - 20 * 1000;
        guardDetection.setGuardsInfo(
          {
            nonce: 'nonce',
            lastUpdate: lastUpdate,
            peerId: '',
            publicKey: guardsPublicKeys[1],
          },
          0
        );
        const payload: ApprovePayload = {
          receivedNonce: 'nonce',
          timestamp: Date.now(),
        };
        await guardDetection.getHandleApproveMessage(
          payload,
          guardsPublicKeys[1],
          'peerId'
        );
        expect(guardDetection.getGuardInfo(0).peerId).toEqual('peerId');
        expect(guardDetection.getGuardInfo(0).lastUpdate).toBeGreaterThan(
          lastUpdate
        );
        expect(handler.send).not.toHaveBeenCalled();
      }
    );

    /**
     * @target
     * `handleApproveMessage` Should send approve message if nonce is set in
     *  the payload and received nonce is equal to sender nonce
     * @dependencies
     * - Date library
     * - `send`
     * @scenario
     * - calling `handleApproveMessage` with a valid message and check the sent message
     * @expected
     * - the sent message should be an approve message with the new nonce and the received nonce
     */
    it(
      'Should send approve message if nonce is set in the payload and received ' +
        'nonce is equal to sender nonce',
      async () => {
        jest.spyOn(handler, 'send').mockClear();
        jest.spyOn(handler, 'send');
        const guardDetection = new mockGuardDetection(handler, config);
        guardDetection.setGuardsInfo(
          {
            nonce: 'nonce',
            lastUpdate: 0,
            peerId: '',
            publicKey: guardsPublicKeys[1],
          },
          0
        );
        const payload: ApprovePayload = {
          nonce: 'new nonce',
          receivedNonce: 'nonce',
          timestamp: Date.now(),
        };
        await guardDetection.getHandleApproveMessage(
          payload,
          guardsPublicKeys[1],
          'peerId'
        );
        expect(guardDetection.getGuardInfo(0).nonce).toEqual('nonce');
        expect(guardDetection.getGuardInfo(0).peerId).toEqual('peerId');
        expect(handler.send).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'approve',
            pk: guardsPublicKeys[0],
            payload: expect.stringContaining(
              '{"receivedNonce":"new nonce","timestamp"'
            ),
            signature: 'signature',
            receiver: guardsPublicKeys[1],
          })
        );
      }
    );
  });

  describe('handleHeartbeatMessage', () => {
    /**
     * @target
     * `handleHeartbeatMessage` Should send approve message just with the received nonce
     * @dependencies
     * - Date library
     * - `send`
     * @scenario
     * - calling `handleHeartbeatMessage` with a valid message and check the sent message
     * @expected
     * - the sent message should be an approve message with the received nonce
     * and the timestamp
     */
    it('Should send approve message just with the received nonce', async () => {
      jest.spyOn(handler, 'send').mockClear();
      jest.spyOn(handler, 'send');
      const guardDetection = new mockGuardDetection(handler, config);
      const payload: HeartbeatPayload = {
        nonce: 'nonce',
        timestamp: Date.now(),
      };
      await guardDetection.getHandleHeartbeatMessage(
        payload,
        guardsPublicKeys[1]
      );
      expect(handler.send).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'approve',
          pk: guardsPublicKeys[0],
          payload: expect.stringContaining(
            '{"receivedNonce":"nonce","timestamp"'
          ),
          signature: 'signature',
          receiver: guardsPublicKeys[1],
        })
      );
    });
  });

  describe('handleReceiveMessage', () => {
    /**
     * @target
     * `handleReceiveMessage` Should call the correct handler for the message register
     * with correct signature
     * @dependencies
     * - Date library
     * - `handleRegisterMessage`
     * @scenario
     * - calling `handleReceiveMessage` with a valid message and check the called handler
     * @expected
     * - the called handler should be `handleRegisterMessage`
     */
    it('Should call the correct handler for the message register with correct signature', async () => {
      const guardDetection = new mockGuardDetection(handler, config);
      const spiedHandleRegister = jest.spyOn(
        Object.getPrototypeOf(guardDetection),
        'handleRegisterMessage'
      );
      const parsedMessage: Message = {
        type: 'register',
        pk: guardsPublicKeys[1],
        payload: JSON.stringify({ nonce: 'nonce', timestamp: Date.now() }),
        signature: 'signature',
        receiver: 'receiver',
      };
      await guardDetection.getHandleReceivedMessage(
        JSON.stringify(parsedMessage),
        'peerId'
      );
      expect(spiedHandleRegister).toHaveBeenCalled();
      spiedHandleRegister.mockClear();
    });

    /**
     * @target
     * `handleReceiveMessage` Should call the correct handler for the message approve
     * with correct signature
     * @dependencies
     * - Date library
     * - `handleHeartbeatMessage`
     * @scenario
     * - calling `handleReceiveMessage` with a valid message and check the called handler
     * @expected
     * - the called handler should be `handleApproveMessage`
     */
    it('Should call the correct handler for the message approve with correct signature', async () => {
      const guardDetection = new mockGuardDetection(handler, config);
      const spiedHandleApprove = jest.spyOn(
        Object.getPrototypeOf(guardDetection),
        'handleApproveMessage'
      );
      const parsedMessage: Message = {
        type: 'approve',
        pk: guardsPublicKeys[1],
        payload: JSON.stringify({
          nonce: 'nonce',
          receivedNonce: 'nonce',
          timestamp: Date.now(),
        }),
        signature: 'signature',
        receiver: 'receiver',
      };
      await guardDetection.getHandleReceivedMessage(
        JSON.stringify(parsedMessage),
        'peerId'
      );
      expect(spiedHandleApprove).toHaveBeenCalled();
      spiedHandleApprove.mockClear();
    });

    /**
     * @target
     * `handleReceiveMessage` Should call the correct handler for the message heartbeat
     * with correct signature
     * @dependencies
     * - Date library
     * - `handleHeartbeatMessage`
     * @scenario
     * - calling `handleReceiveMessage` with a valid message and check the called handler
     * @expected
     * - the called handler should be `handleHeartbeatMessage`
     */
    it('Should call the correct handler for the message heartbeat with correct signature', async () => {
      const guardDetection = new mockGuardDetection(handler, config);
      const spiedHandleHeartbeat = jest.spyOn(
        Object.getPrototypeOf(guardDetection),
        'handleHeartbeatMessage'
      );
      const parsedMessage: Message = {
        type: 'heartbeat',
        pk: guardsPublicKeys[1],
        payload: JSON.stringify({ nonce: 'nonce', timestamp: Date.now() }),
        signature: 'signature',
        receiver: 'receiver',
      };
      await guardDetection.getHandleReceivedMessage(
        JSON.stringify(parsedMessage),
        'peerId'
      );
      expect(spiedHandleHeartbeat).toHaveBeenCalled();
      spiedHandleHeartbeat.mockClear();
    });

    /**
     * @target
     * `handleReceiveMessage` Should not call any handler if the signature is not correct
     * @dependencies
     * - Date library
     *
     * @scenario
     * - calling `handleReceiveMessage` with a valid message with incorrect signature
     * and check the called handler
     * @expected
     * - no handler should be called
     */
    it('Should not call any handler if the signature is not correct', async () => {
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
        payload: JSON.stringify({ nonce: 'nonce' }),
        signature: 'wrong signature',
        receiver: 'receiver',
      };
      await guardDetection.getHandleReceivedMessage(
        JSON.stringify(parsedMessage),
        'peerId'
      );
      expect(spiedHandleHeartbeat).not.toHaveBeenCalled();
      expect(spiedHandleApprove).not.toHaveBeenCalled();
      expect(spiedHandleRegister).not.toHaveBeenCalled();
    });

    /**
     * @target
     * `handleReceiveMessage` Should not call any handler if timestamp is not valid
     * @dependencies
     * - Date library
     * @scenario
     * - calling `handleReceiveMessage` with a valid message with incorrect timestamp
     * and check the called handler
     * @expected
     * - no handler should be called
     */
    it('Should not call any handler if timestamp is not valid', async () => {
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
          nonce: 'nonce',
          timestamp: Date.now() - 4 * 60 * 1000,
        }),
        signature: 'signature',
        receiver: 'receiver',
      };
      await guardDetection.getHandleReceivedMessage(
        JSON.stringify(parsedMessage),
        'peerId'
      );
      expect(spiedHandleHeartbeat).not.toHaveBeenCalled();
      expect(spiedHandleApprove).not.toHaveBeenCalled();
      expect(spiedHandleRegister).not.toHaveBeenCalled();
    });
  });

  describe('getActiveGuards', () => {
    /**
     * @target
     * `getActiveGuards` Should return the active guards
     * @dependencies
     * - Date library
     * @scenario
     * - calling `getActiveGuards` and check the returned value
     * @expected
     * - the returned value should be the active guards peerId
     */
    it('Should return the active guards', () => {
      const guardDetection = new mockGuardDetection(handler, config);
      guardDetection.setGuardsInfo(
        { nonce: 'nonce', lastUpdate: Date.now(), peerId: '', publicKey: '' },
        0
      );
      guardDetection.setGuardsInfo(
        {
          nonce: 'nonce',
          lastUpdate: Date.now() - 3 * 60 * 1000,
          peerId: 'peerId1',
          publicKey: 'publicKey1',
        },
        1
      );
      guardDetection.setGuardsInfo(
        {
          nonce: 'nonce',
          lastUpdate: Date.now() - 50 * 1000,
          peerId: 'peerId2',
          publicKey: 'publicKey2',
        },
        2
      );
      expect(guardDetection.getActiveGuards()).toEqual([
        { peerId: 'peerId2', publicKey: 'publicKey2' },
      ]);
    });
  });

  describe('sendRegisterMessage', () => {
    /**
     * @target
     * `sendRegisterMessage` Should send register message to the guard
     * @dependencies
     * @scenario
     * - calling `sendRegisterMessage` and check the sent message
     * @expected
     * - the sent message should be the register message with the correct payload
     */
    it('Should send register message to the guard', async () => {
      const guardDetection = new mockGuardDetection(handler, config);
      jest
        .spyOn(Object.getPrototypeOf(guardDetection), 'generateNonce')
        .mockReturnValue('new nonce');
      jest.spyOn(handler, 'send').mockClear();
      guardDetection.setGuardsInfo(
        {
          nonce: 'nonce',
          lastUpdate: Date.now(),
          peerId: 'peerId',
          publicKey: guardsPublicKeys[1],
        },
        0
      );
      await guardDetection.getSendRegisterMessage(0);
      expect(handler.send).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'register',
          pk: guardsPublicKeys[0],
          payload: expect.stringContaining('{"nonce":"new nonce","timestamp"'),
          signature: 'signature',
          receiver: guardsPublicKeys[1],
        })
      );
    });
  });

  describe('sendHeartbeatMessage', () => {
    /**
     * @target
     * `sendHeartbeatMessage` Should send heartbeat message to the guard
     * @dependencies
     * @scenario
     * - calling `sendHeartbeatMessage` and check the sent message
     * @expected
     * - the sent message should be the heartbeat message with the correct payload
     */
    it('Should send heartbeat message to the guard', async () => {
      const guardDetection = new mockGuardDetection(handler, config);
      jest
        .spyOn(Object.getPrototypeOf(guardDetection), 'generateNonce')
        .mockReturnValue('new nonce');
      jest.spyOn(handler, 'send').mockClear();
      guardDetection.setGuardsInfo(
        {
          nonce: 'nonce',
          lastUpdate: Date.now(),
          peerId: 'peerId',
          publicKey: guardsPublicKeys[1],
        },
        0
      );
      await guardDetection.getSendHeartbeatMessage(0);
      expect(handler.send).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'heartbeat',
          pk: guardsPublicKeys[0],
          payload: expect.stringContaining('{"nonce":"new nonce","timestamp"'),
          signature: 'signature',
          receiver: guardsPublicKeys[1],
        })
      );
    });
  });

  describe('updateGuardsStatus', () => {
    /**
     * @target
     * `updateGuardsStatus` Should send register message to guards that passed register timeout
     * @dependencies
     * - Date library
     * @scenario
     * - calling `updateGuardsStatus` and check the send handler
     * @expected
     * - the send handler should be called with the correct message
     */
    it('Should send register message to guards that passed register timeout', async () => {
      const guardDetection = new mockGuardDetection(handler, config);
      jest
        .spyOn(Object.getPrototypeOf(guardDetection), 'generateNonce')
        .mockReturnValue('new nonce');
      jest.spyOn(handler, 'send').mockClear();
      guardDetection.setGuardsInfo(
        {
          nonce: 'nonce',
          lastUpdate: Date.now(),
          peerId: 'peerId',
          publicKey: guardsPublicKeys[1],
        },
        0
      );
      guardDetection.setGuardsInfo(
        {
          nonce: 'nonce',
          lastUpdate: Date.now() - 3 * 60 * 1000,
          peerId: 'peerId1',
          publicKey: guardsPublicKeys[2],
        },
        1
      );
      guardDetection.setGuardsInfo(
        {
          nonce: 'nonce',
          lastUpdate: Date.now() - 55 * 1000,
          peerId: 'peerId2',
          publicKey: guardsPublicKeys[3],
        },
        2
      );
      jest.useFakeTimers();
      await guardDetection.runUpdateGuardsStatus();
      expect(handler.send).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'register',
          pk: guardsPublicKeys[0],
          payload: expect.stringContaining('{"nonce":"new nonce","timestamp"'),
          signature: 'signature',
          receiver: guardsPublicKeys[2],
        })
      );
    });

    /**
     * @target
     * `updateGuardsStatus` Should send heartbeat message to guards that passed heartbeat timeout
     * @dependencies
     * - Date library
     * @scenario
     * - calling `updateGuardsStatus` and check the send handler
     * @expected
     * - the send handler should be called with the correct message
     */
    it('Should send heartbeat message to guards that passed heartbeat timeout', async () => {
      const guardDetection = new mockGuardDetection(handler, config);
      jest
        .spyOn(Object.getPrototypeOf(guardDetection), 'generateNonce')
        .mockReturnValue('new nonce');
      jest.spyOn(handler, 'send').mockClear();
      guardDetection.setGuardsInfo(
        {
          nonce: 'nonce',
          lastUpdate: Date.now(),
          peerId: 'peerId',
          publicKey: guardsPublicKeys[1],
        },
        0
      );
      guardDetection.setGuardsInfo(
        {
          nonce: 'nonce',
          lastUpdate: Date.now() - 61 * 1000,
          peerId: 'peerId1',
          publicKey: guardsPublicKeys[2],
        },
        1
      );
      guardDetection.setGuardsInfo(
        {
          nonce: 'nonce',
          lastUpdate: Date.now() - 55 * 1000,
          peerId: 'peerId2',
          publicKey: guardsPublicKeys[3],
        },
        2
      );
      await guardDetection.runUpdateGuardsStatus();
      expect(handler.send).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'heartbeat',
          pk: guardsPublicKeys[0],
          payload: expect.stringContaining('{"nonce":"new nonce","timestamp"'),
          signature: 'signature',
          receiver: guardsPublicKeys[2],
        })
      );
    });
  });
});
