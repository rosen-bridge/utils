import {
  ApprovePayload,
  HeartbeatPayload,
  Message,
  RegisterPayload,
} from '../lib/types';
import { GuardDetection } from '../lib';
import { config, guardsPublicKeys, handler } from './testUtils';
import { TestGuardDetection } from './TestGuardDetection';
import { registerTimeout } from '../lib/constants/constants';

describe('GuardDetection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe('generateNonce', () => {
    /**
     * @target
     * `generateNonce` Should generate a random base64 encoded nonce with the default size 32
     * @dependencies
     * @scenario
     * - run test without a size parameter
     * - check returned value
     * @expected
     * - the length of the nonce should be 32 byte after base64 decoding
     */
    it('Should generate a random base64 encoded nonce with the default size 32', () => {
      const guardDetection = new GuardDetection(handler, config);
      const guardDetectionProto = guardDetection as any;
      const nonce = guardDetectionProto.generateNonce();
      const decodedNonce = Buffer.from(nonce, 'base64').toString('hex');
      expect(decodedNonce).toHaveLength(32 * 2);
    });

    /**
     * @target
     * `generateNonce` Should generate a random base64 encoded nonce with the given size
     * @dependencies
     * @scenario
     * - run test with size parameter
     * - check returned value
     * @expected
     * - the length of the nonce should be 10 byte after base64 decoding
     */
    it('Should generate a random base64 encoded nonce with the given size', () => {
      const guardDetection = new GuardDetection(handler, config);
      const guardDetectionProto = guardDetection as any;
      const nonce = guardDetectionProto.generateNonce(10);
      const decodedNonce = Buffer.from(nonce, 'base64').toString('hex');
      expect(decodedNonce).toHaveLength(10 * 2);
    });
  });

  describe('checkMessageSign', () => {
    /**
     * @target
     * `checkMessageSign` Should return true if public key of sender
     *   be in the valid public keys and message signature should be true
     * @dependencies
     * @scenario
     * - Mocking a message with valid signature and public key
     * - check the return value
     * @expected
     * - the return value should be true
     */
    it('Should return true if public key of sender be in the valid public keys and message signature should be true', () => {
      const guardDetection = new TestGuardDetection(handler, config);
      const parsedMessage: Message = {
        type: 'approval',
        pk: guardsPublicKeys[1],
        payload: 'payload',
        signature: 'signature',
        receiver: 'receiver',
      };
      const isValid = guardDetection.getCheckMessageSign(parsedMessage);
      expect(isValid).toEqual(true);
    });

    /**
     * @target
     * `checkMessageSign` Should return false if the message have not a valid signature
     * @dependencies
     * @scenario
     * - Mock a message with not valid signature
     * - check the return value
     * @expected
     * - the return value should be false
     */
    it('Should return false if the message is not have valid signature', () => {
      const guardDetection = new TestGuardDetection(handler, config);
      const parsedMessage: Message = {
        type: 'approval',
        pk: guardsPublicKeys[1],
        payload: 'payload',
        signature: 'not valid signature',
        receiver: 'receiver',
      };
      const isValid = guardDetection.getCheckMessageSign(parsedMessage);
      expect(isValid).toEqual(false);
    });

    /**
     * @target
     * `checkMessageSign` Should return false if the message have not a valid public key
     * @dependencies
     * @scenario
     * - Mock a message with not valid public key
     * - check the return value
     * @expected
     * - the return value should be false
     */
    it('Should return false if the message have not a valid public key', () => {
      const guardDetection = new TestGuardDetection(handler, config);
      const parsedMessage: Message = {
        type: 'approval',
        pk: 'not valid public key',
        payload: 'payload',
        signature: 'signature',
        receiver: 'receiver',
      };
      const isValid = guardDetection.getCheckMessageSign(parsedMessage);
      expect(isValid).toEqual(false);
    });
  });

  describe('checkTimestamp', () => {
    /**
     * @target
     * `checkTimestamp` Should return true if the timestamp is less than timestampTolerance
     * @dependencies
     * @scenario
     * - run test with a timestamp less than timestampTolerance
     * - check the return value
     * @expected
     * - the return value should be true
     */
    it('Should return true if the timestamp is less than timestampTolerance', () => {
      const guardDetection = new TestGuardDetection(handler, config);
      const isValid = guardDetection.getCheckTimestamp(Date.now());
      expect(isValid).toEqual(true);
    });

    /**
     * @target
     * `checkTimestamp` Should return false if the timestamp is not less than timestampTolerance
     * @dependencies
     * @scenario
     * - run test with a timestamp not less than timestampTolerance
     * - check the return value
     * @expected
     * - the return value should be false
     */
    it('Should return false if the timestamp is not less than timestampTolerance', () => {
      const guardDetection = new TestGuardDetection(handler, config);
      const isValid = guardDetection.getCheckTimestamp(
        Date.now() - 2 * 60 * 1000
      );
      expect(isValid).toEqual(false);
    });
  });

  describe('publicKeyToIndex', () => {
    /**
     * @target
     * `publicKeyToIndex` Should return the index of the public key
     * @dependencies
     * @scenario
     * - run test with a valid public key
     * - check the return value
     * @expected
     * - the return value should be the index of the public key
     */
    it('Should return the index of the public key', () => {
      const guardDetection = new TestGuardDetection(handler, config);
      guardDetection.setGuardsInfo(
        {
          publicKey: guardsPublicKeys[1],
          nonce: 'nonce',
          lastUpdate: Date.now(),
          peerId: 'peerId',
          recognitionPromises: [],
        },
        0
      );

      guardDetection.setGuardsInfo(
        {
          publicKey: guardsPublicKeys[2],
          nonce: 'nonce',
          lastUpdate: Date.now(),
          peerId: 'peerId',
          recognitionPromises: [],
        },
        1
      );

      guardDetection.setGuardsInfo(
        {
          publicKey: guardsPublicKeys[3],
          nonce: 'nonce',
          lastUpdate: Date.now(),
          peerId: 'peerId',
          recognitionPromises: [],
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
     * - run test with a not valid public key
     * - check the return value
     * @expected
     * - the return value should be -1
     */
    it('Should return -1 if the public key is not in the list', () => {
      const guardDetection = new TestGuardDetection(handler, config);
      const index = guardDetection.getPublicKeyToIndex('publicKey');
      expect(index).toEqual(-1);
    });
  });

  describe('handleRegisterMessage', () => {
    /**
     * @target
     * `handleRegisterMessage` Should send an approval message with the new
     *   nonce and the received nonce
     * @dependencies
     * - `generateNonce`
     * - `send`
     * @scenario
     * - Mock a regsiter message
     * - Mock the `generateNonce` method
     * - run test
     * - check the sent message
     * @expected
     * - The sent message should be an approval message with the new nonce and the received nonce
     */
    it('Should send an approval message with the new nonce and the received nonce', async () => {
      jest.spyOn(handler, 'send');
      const guardDetection = new TestGuardDetection(handler, config);
      jest
        .spyOn(guardDetection as any, 'generateNonce')
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
          type: 'approval',
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
     * - `send`
     * @scenario
     * - Mock a approval message
     * - Mock the `send` method
     * - run test
     * - check the result
     * @expected
     * - the saved peerId should be the received peerId
     * - the lastUpdate should be greater than the lastUpdate before calling `handleApproveMessage`
     * - the 'send' method should be called
     */
    it('Should save peerId in case of received nonce is equal to sender nonce and lastUpdate is less than guardsHeartbeatTimeout', async () => {
      jest.spyOn(handler, 'send');
      const guardDetection = new TestGuardDetection(handler, config);
      const lastUpdate = Date.now() - 20 * 1000;
      guardDetection.setGuardsInfo(
        {
          nonce: 'nonce',
          lastUpdate: lastUpdate,
          peerId: '',
          publicKey: guardsPublicKeys[1],
          recognitionPromises: [],
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
    });

    /**
     * @target
     * `handleApproveMessage` Should send approve message if nonce is set in
     *  the payload and received nonce is equal to sender nonce
     * @dependencies
     * - `send`
     * @scenario
     * - Mock approval payload
     * - run test
     * - check the sent message
     * @expected
     * - the sent message should be an approve message with the new nonce and the received nonce
     */
    it('Should send approval message if nonce is set in the payload and received nonce is equal to sender nonce', async () => {
      const guardDetection = new TestGuardDetection(handler, config);
      guardDetection.setGuardsInfo(
        {
          nonce: 'nonce',
          lastUpdate: 0,
          peerId: '',
          publicKey: guardsPublicKeys[1],
          recognitionPromises: [],
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
          type: 'approval',
          pk: guardsPublicKeys[0],
          payload: expect.stringContaining(
            '{"receivedNonce":"new nonce","timestamp"'
          ),
          signature: 'signature',
          receiver: guardsPublicKeys[1],
        })
      );
    });
  });

  describe('handleHeartbeatMessage', () => {
    /**
     * @target
     * `handleHeartbeatMessage` Should send approval message just with the received nonce
     * @dependencies
     * - `send`
     * @scenario
     * - Mock Heartbeat payload
     * - run test
     * - check the sent message
     * @expected
     * - the sent message should be an approval message with the received nonce
     * and the timestamp
     */
    it('Should send approval message just with the received nonce', async () => {
      jest.spyOn(handler, 'send');
      const guardDetection = new TestGuardDetection(handler, config);
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
          type: 'approval',
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
     * - `handleRegisterMessage`
     * @scenario
     * - Mock Message with a valid message
     * - Run test
     * - check the called handler
     * @expected
     * - the called handler should be `handleRegisterMessage`
     */
    it('Should call the correct handler for the message register with correct signature', async () => {
      const guardDetection = new TestGuardDetection(handler, config);
      const spiedHandleRegister = jest.spyOn(
        guardDetection as any,
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
    });

    /**
     * @target
     * `handleReceiveMessage` Should call the correct handler for the message approval
     * with correct signature
     * @dependencies
     * - `handleHeartbeatMessage`
     * @scenario
     * - Mock Message with a valid message
     * - Run test
     * - check the called handler
     * @expected
     * - the called handler should be `handleApproveMessage`
     */
    it('Should call the correct handler for the message approval with correct signature', async () => {
      const guardDetection = new TestGuardDetection(handler, config);
      const spiedHandleApprove = jest.spyOn(
        guardDetection as any,
        'handleApproveMessage'
      );
      const parsedMessage: Message = {
        type: 'approval',
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
    });

    /**
     * @target
     * `handleReceiveMessage` Should call the correct handler for the message heartbeat
     * with correct signature
     * @dependencies
     * - `handleHeartbeatMessage`
     * @scenario
     * - Mock Message with a valid message
     * - Run test
     * - check the called handler
     * @expected
     * - the called handler should be `handleHeartbeatMessage`
     */
    it('Should call the correct handler for the message heartbeat with correct signature', async () => {
      const guardDetection = new TestGuardDetection(handler, config);
      const spiedHandleHeartbeat = jest.spyOn(
        guardDetection as any,
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
    });

    /**
     * @target
     * `handleReceiveMessage` Should not call any handler if the signature is not correct
     * @dependencies*
     * @scenario
     * - - Mock Message with a valid message but wrong signature
     * - Run test
     * - check the called handler
     * @expected
     * - no handler should be called
     */
    it('Should not call any handler if the signature is not correct', async () => {
      const guardDetection = new TestGuardDetection(handler, config);
      const spiedHandleHeartbeat = jest.spyOn(
        guardDetection as any,
        'handleHeartbeatMessage'
      );
      const spiedHandleApprove = jest.spyOn(
        guardDetection as any,
        'handleApproveMessage'
      );
      const spiedHandleRegister = jest.spyOn(
        guardDetection as any,
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
     * @scenario
     * - Mock Message with a valid message but wrong timestamp
     * - Run test
     * - check the called handler
     * @expected
     * - no handler should be called
     */
    it('Should not call any handler if timestamp is not valid', async () => {
      const guardDetection = new TestGuardDetection(handler, config);
      const spiedHandleHeartbeat = jest.spyOn(
        guardDetection as any,
        'handleHeartbeatMessage'
      );
      const spiedHandleApprove = jest.spyOn(
        guardDetection as any,
        'handleApproveMessage'
      );
      const spiedHandleRegister = jest.spyOn(
        guardDetection as any,
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

  describe('isGuardActive', () => {
    /**
     * @target
     * `isGuardActive` Should return false if the guard is not set
     * @dependencies
     * @scenario
     * - mock the guard info
     * - Run test
     * - check the result
     * @expected
     * - the result should be false
     */
    it('Should return false if the guard is not set', () => {
      const guardDetection = new TestGuardDetection(handler, config);
      guardDetection.setGuardsInfo(
        {
          nonce: 'nonce',
          lastUpdate: Date.now(),
          peerId: '',
          publicKey: '',
          recognitionPromises: [],
        },
        0
      );
      expect(guardDetection.getIsGuardActive(0)).toEqual(false);
    });

    /**
     * @target
     * `isGuardActive` Should return false if the guard is not active
     * @dependencies
     * @scenario
     * - mock the guard info
     * - Run test
     * - check the result
     * @expected
     * - the result should be false
     */
    it('Should return false if the guard is not active', () => {
      const guardDetection = new TestGuardDetection(handler, config);
      guardDetection.setGuardsInfo(
        {
          nonce: 'nonce',
          lastUpdate: Date.now() - registerTimeout * 2,
          peerId: 'peerId1',
          publicKey: 'publicKey1',
          recognitionPromises: [],
        },
        1
      );
      expect(guardDetection.getIsGuardActive(1)).toEqual(false);
    });

    /**
     * @target
     * `isGuardActive` Should return true if the guard is active
     * @dependencies
     * @scenario
     * - mock the guard info
     * - Run test
     * - check the result
     * @expected
     * - the result should be true
     */
    it('Should return true if the guard is active', () => {
      const guardDetection = new TestGuardDetection(handler, config);
      guardDetection.setGuardsInfo(
        {
          nonce: 'nonce',
          lastUpdate: Date.now() - 50 * 1000,
          peerId: 'peerId2',
          publicKey: 'publicKey2',
          recognitionPromises: [],
        },
        2
      );
      expect(guardDetection.getIsGuardActive(2)).toEqual(true);
    });
  });

  describe('getActiveGuards', () => {
    /**
     * @target
     * `getActiveGuards` Should return the active guards
     * @dependencies
     * @scenario
     * - Mock guardsInfo
     * - Run test
     * - check the returned value
     * @expected
     * - the returned value should be the active guards peerId
     */
    it('Should return the active guards', () => {
      const guardDetection = new TestGuardDetection(handler, config);
      guardDetection.setGuardsInfo(
        {
          nonce: 'nonce',
          lastUpdate: Date.now(),
          peerId: '',
          publicKey: '',
          recognitionPromises: [],
        },
        0
      );
      guardDetection.setGuardsInfo(
        {
          nonce: 'nonce',
          lastUpdate: Date.now() - registerTimeout * 2,
          peerId: 'peerId1',
          publicKey: 'publicKey1',
          recognitionPromises: [],
        },
        1
      );
      guardDetection.setGuardsInfo(
        {
          nonce: 'nonce',
          lastUpdate: Date.now() - 50 * 1000,
          peerId: 'peerId2',
          publicKey: 'publicKey2',
          recognitionPromises: [],
        },
        2
      );
      expect(guardDetection.getActiveGuards()).toEqual([
        { peerId: 'peerId2', publicKey: 'publicKey2' },
      ]);
    });
  });

  describe('register', () => {
    /**
     * @target
     * `register` Should throw error if the peerId is not valid
     * @dependencies
     * @scenario
     * - Run test (call register with invalid peerId)
     * - check the returned value
     * @expected
     * - Should throw error
     */
    it('Should throw error if the public key is not valid', () => {
      const guardDetection = new TestGuardDetection(handler, config);
      const result = guardDetection.register('peerId1', 'publicKey1');
      expect(result).rejects.toThrowError('Guard not found');
    });

    /**
     * @target
     * `register` Should return two promise that resolves true in case of
     * adding same guard twice
     * @dependencies
     * @scenario
     * - mock the guard info
     * - mock generateNonce
     * - call register with valid peerId
     * - Mock approve message received from guard with peerId1
     * - Run test
     * - check the returned value
     * @expected
     * - Should return  two Promise<true>
     */
    it('Should return two promise that resolves true in case of adding same guard twice', async () => {
      const guardDetection = new TestGuardDetection(handler, config);
      jest
        .spyOn(guardDetection as any, 'generateNonce')
        .mockReturnValue('nonce');
      guardDetection.setGuardsInfo(
        {
          nonce: 'nonce',
          lastUpdate: Date.now() - 50 * 1000,
          peerId: 'peerId1',
          publicKey: 'publicKey1',
          recognitionPromises: [],
        },
        1
      );
      const result = guardDetection.register('peerId1', 'publicKey1');
      const resultSecond = guardDetection.register('peerId1', 'publicKey1');
      const payload: ApprovePayload = {
        nonce: 'new nonce',
        receivedNonce: 'nonce',
        timestamp: Date.now(),
      };
      await guardDetection.getHandleApproveMessage(
        payload,
        'publicKey1',
        'peerId1'
      );
      expect(await result).toEqual(true);
      expect(await resultSecond).toEqual(true);
    });

    /**
     * @target
     * `register` Should send register message if the guard is not in the list
     * @dependencies
     * @scenario
     * - mock the guard info
     * - call register with valid peerId
     * - Run test
     * - check the returned value
     * - check the called function
     * @expected
     * - Should send register message
     * - Should return Promise
     */
    it('Should send register message if the guard is not in the list', () => {
      const guardDetection = new TestGuardDetection(handler, config);
      guardDetection.setGuardsInfo(
        {
          nonce: '',
          lastUpdate: 0,
          peerId: '',
          publicKey: 'publicKey1',
          recognitionPromises: [],
        },
        1
      );

      const spiedSendRegisterMessage = jest.spyOn(
        guardDetection as any,
        'sendRegisterMessage'
      );
      const result = guardDetection.register('peerId1', 'publicKey1');
      expect(result).toBeInstanceOf(Promise);
      expect(spiedSendRegisterMessage).toHaveBeenCalled();
    });

    /**
     * @target
     * `register` Should send heartbeat message if the guard is in the list but not active
     * @dependencies
     * @scenario
     * - mock generateNonce
     * - mock the guard info
     * - call register with valid peerId
     * - Mock approve message received from guard with peerId1
     * - Run test
     * - check the called function
     * - check the returned value
     * @expected
     * - Should send heartbeat message
     * - Should return Promise that resolves true
     */
    it('Should send heartbeat message if the guard is in the list but not active', async () => {
      const guardDetection = new TestGuardDetection(handler, config);
      jest
        .spyOn(guardDetection as any, 'generateNonce')
        .mockReturnValue('nonce');
      guardDetection.setGuardsInfo(
        {
          nonce: 'nonce',
          lastUpdate: Date.now() - registerTimeout * 2,
          peerId: 'peerId1',
          publicKey: 'publicKey1',
          recognitionPromises: [],
        },
        1
      );

      const spiedSendHeartbeatMessage = jest.spyOn(
        guardDetection as any,
        'sendHeartbeatMessage'
      );
      const result = guardDetection.register('peerId1', 'publicKey1');
      const payload: ApprovePayload = {
        nonce: 'new nonce',
        receivedNonce: 'nonce',
        timestamp: Date.now(),
      };
      await guardDetection.getHandleApproveMessage(
        payload,
        'publicKey1',
        'peerId1'
      );
      expect(spiedSendHeartbeatMessage).toBeCalled();
      expect(await result).toEqual(true);
    });

    /**
     * @target
     * `register` Should reject if the guard is in the list but peerId is not the same
     * @dependencies
     * @scenario
     * - mock the guard info
     * - call register with valid peerId
     * - Run test
     * - check the returned value
     * @expected
     * - Should reject with error
     */
    it('Should reject if the guard is in the list but peerId is not the same', async () => {
      const guardDetection = new TestGuardDetection(handler, config);
      guardDetection.setGuardsInfo(
        {
          nonce: 'nonce',
          lastUpdate: Date.now() - registerTimeout * 2,
          peerId: 'peerId1',
          publicKey: 'publicKey1',
          recognitionPromises: [],
        },
        1
      );
      const result = guardDetection.register('peerId2', 'publicKey1');
      expect(result).rejects.toThrowError('PeerId is not the same');
    });
  });

  describe('sendRegisterMessage', () => {
    /**
     * @target
     * `sendRegisterMessage` Should send register message to the guard
     * @dependencies
     * @scenario
     * - Mock the guardDetection.generateNonce
     * - Mock guardInfo
     * - Run test
     * - check the sent message
     * @expected
     * - the sent message should be the register message with the correct payload
     */
    it('Should send register message to the guard', async () => {
      const guardDetection = new TestGuardDetection(handler, config);
      jest
        .spyOn(guardDetection as any, 'generateNonce')
        .mockReturnValue('new nonce');
      guardDetection.setGuardsInfo(
        {
          nonce: 'nonce',
          lastUpdate: Date.now(),
          peerId: 'peerId',
          publicKey: guardsPublicKeys[1],
          recognitionPromises: [],
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
     * - Mock the guardDetection.generateNonce
     * - Mock guardInfo
     * - Run test
     * - check the sent message
     * @expected
     * - the sent message should be the heartbeat message with the correct payload
     */
    it('Should send heartbeat message to the guard', async () => {
      const guardDetection = new TestGuardDetection(handler, config);
      jest
        .spyOn(guardDetection as any, 'generateNonce')
        .mockReturnValue('new nonce');
      guardDetection.setGuardsInfo(
        {
          nonce: 'nonce',
          lastUpdate: Date.now(),
          peerId: 'peerId',
          publicKey: guardsPublicKeys[1],
          recognitionPromises: [],
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
     * @scenario
     * - Mock the guardDetection.generateNonce
     * - Mock guardInfo
     * - Run test
     * - check the send handler
     * @expected
     * - the send handler should be called with the correct message
     */
    it('Should send register message to guards that passed register timeout', async () => {
      const guardDetection = new TestGuardDetection(handler, config);
      jest
        .spyOn(guardDetection as any, 'generateNonce')
        .mockReturnValue('new nonce');
      guardDetection.setGuardsInfo(
        {
          nonce: 'nonce',
          lastUpdate: Date.now(),
          peerId: 'peerId',
          publicKey: guardsPublicKeys[1],
          recognitionPromises: [],
        },
        0
      );
      guardDetection.setGuardsInfo(
        {
          nonce: 'nonce',
          lastUpdate: Date.now() - registerTimeout * 2,
          peerId: 'peerId1',
          publicKey: guardsPublicKeys[2],
          recognitionPromises: [],
        },
        1
      );
      guardDetection.setGuardsInfo(
        {
          nonce: 'nonce',
          lastUpdate: Date.now() - 55 * 1000,
          peerId: 'peerId2',
          publicKey: guardsPublicKeys[3],
          recognitionPromises: [],
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
     * @scenario
     * - Mock the guardDetection.generateNonce
     * - Mock guardInfo
     * - Run test
     * - check the send handler
     * @expected
     * - the send handler should be called with the correct message
     */
    it('Should send heartbeat message to guards that passed heartbeat timeout', async () => {
      const guardDetection = new TestGuardDetection(handler, config);
      jest
        .spyOn(guardDetection as any, 'generateNonce')
        .mockReturnValue('new nonce');
      guardDetection.setGuardsInfo(
        {
          nonce: 'nonce',
          lastUpdate: Date.now(),
          peerId: 'peerId',
          publicKey: guardsPublicKeys[1],
          recognitionPromises: [],
        },
        0
      );
      guardDetection.setGuardsInfo(
        {
          nonce: 'nonce',
          lastUpdate: Date.now() - 61 * 1000,
          peerId: 'peerId1',
          publicKey: guardsPublicKeys[2],
          recognitionPromises: [],
        },
        1
      );
      guardDetection.setGuardsInfo(
        {
          nonce: 'nonce',
          lastUpdate: Date.now() - 55 * 1000,
          peerId: 'peerId2',
          publicKey: guardsPublicKeys[3],
          recognitionPromises: [],
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