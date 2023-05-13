import {
  ApprovePayload,
  HeartbeatPayload,
  Message,
  RegisterPayload,
  RequestToSignPayload,
  SignPayload,
} from '../lib/types';
import { GuardDetection } from '../lib';
import {
  config,
  guardsPrivateKeys,
  guardsPublicKeys,
  handler,
  tssHandler,
} from './testUtils';
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
      const guardDetection = new GuardDetection(handler, config, tssHandler);
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
      const guardDetection = new GuardDetection(handler, config, tssHandler);
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
      const guardDetection = new TestGuardDetection(
        handler,
        config,
        tssHandler
      );
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
      const guardDetection = new TestGuardDetection(
        handler,
        config,
        tssHandler
      );
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
      const guardDetection = new TestGuardDetection(
        handler,
        config,
        tssHandler
      );
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
      const guardDetection = new TestGuardDetection(
        handler,
        config,
        tssHandler
      );
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
      const guardDetection = new TestGuardDetection(
        handler,
        config,
        tssHandler
      );
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
      const guardDetection = new TestGuardDetection(
        handler,
        config,
        tssHandler
      );
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
      const guardDetection = new TestGuardDetection(
        handler,
        config,
        tssHandler
      );
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
      const guardDetection = new TestGuardDetection(
        handler,
        config,
        tssHandler
      );
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
      const guardDetection = new TestGuardDetection(
        handler,
        config,
        tssHandler
      );
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
      const guardDetection = new TestGuardDetection(
        handler,
        config,
        tssHandler
      );
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
      const guardDetection = new TestGuardDetection(
        handler,
        config,
        tssHandler
      );
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
      const guardDetection = new TestGuardDetection(
        handler,
        config,
        tssHandler
      );
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
      const guardDetection = new TestGuardDetection(
        handler,
        config,
        tssHandler
      );
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
      const guardDetection = new TestGuardDetection(
        handler,
        config,
        tssHandler
      );
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
      const guardDetection = new TestGuardDetection(
        handler,
        config,
        tssHandler
      );
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
      const guardDetection = new TestGuardDetection(
        handler,
        config,
        tssHandler
      );
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
      const guardDetection = new TestGuardDetection(
        handler,
        config,
        tssHandler
      );
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
      const guardDetection = new TestGuardDetection(
        handler,
        config,
        tssHandler
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
      const guardDetection = new TestGuardDetection(
        handler,
        config,
        tssHandler
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
      const guardDetection = new TestGuardDetection(
        handler,
        config,
        tssHandler
      );
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
      const guardDetection = new TestGuardDetection(
        handler,
        config,
        tssHandler
      );
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
      const guardDetection = new TestGuardDetection(
        handler,
        config,
        tssHandler
      );
      jest
        .spyOn(guardDetection as any, 'generateNonce')
        .mockReturnValue('nonce');
      guardDetection.setGuardsInfo(
        {
          nonce: 'nonce',
          lastUpdate: Date.now() - 50 * 1000,
          peerId: '',
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
      const guardDetection = new TestGuardDetection(
        handler,
        config,
        tssHandler
      );
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
      const guardDetection = new TestGuardDetection(
        handler,
        config,
        tssHandler
      );
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
      const guardDetection = new TestGuardDetection(
        handler,
        config,
        tssHandler
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
      const guardDetection = new TestGuardDetection(
        handler,
        config,
        tssHandler
      );
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
      const guardDetection = new TestGuardDetection(
        handler,
        config,
        tssHandler
      );
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
      const guardDetection = new TestGuardDetection(
        handler,
        config,
        tssHandler
      );
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
      const guardDetection = new TestGuardDetection(
        handler,
        config,
        tssHandler
      );
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

  describe('timeRemainedToSign', () => {
    it("Should return isTimeToSign false if it's not guard turn to sign", () => {
      const guardDetection = new TestGuardDetection(
        handler,
        config,
        tssHandler
      );
      jest.useFakeTimers().setSystemTime(1000 * 60 * 5);
      expect(guardDetection.getTimeRemindToSign().isTimeToSign).toBe(false);
    });

    it('Should return isTimeToSign true if it guard turn to sign and should return valid remaining time to sign', () => {
      const guardDetection = new TestGuardDetection(
        handler,
        config,
        tssHandler
      );
      jest.useFakeTimers().setSystemTime(1000 * 60 * 4 + 5 * 1000);
      expect(guardDetection.getTimeRemindToSign().isTimeToSign).toBe(true);
      expect(guardDetection.getTimeRemindToSign().timeRemained).toBe(55 * 1000);
    });
  });

  describe('broadcastSign', () => {
    it('Should send sign message to the list provided in input', async () => {
      const guardDetection = new TestGuardDetection(
        handler,
        config,
        tssHandler
      );
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
          nonce: 'nonce2',
          lastUpdate: Date.now(),
          peerId: 'peerId2',
          publicKey: guardsPublicKeys[2],
          recognitionPromises: [],
        },
        1
      );

      const payload = 'payload';
      await guardDetection.getBroadcastSign(payload, [
        {
          publicKey: guardsPublicKeys[1],
          sign: 'sign0',
        },
        { publicKey: guardsPublicKeys[2], sign: 'sign1' },
      ]);
      expect(handler.send).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'sign',
          pk: guardsPublicKeys[0],
          payload: expect.stringContaining(
            '{"payload":"payload","sign":"sign0","timestamp"'
          ),
          signature: 'signature',
          receiver: guardsPublicKeys[1],
        })
      );
      expect(handler.send).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'sign',
          pk: guardsPublicKeys[0],
          payload: expect.stringContaining(
            '{"payload":"payload","sign":"sign1","timestamp"'
          ),
          signature: 'signature',
          receiver: guardsPublicKeys[2],
        })
      );
    });
  });

  describe('registerAndWaitForApprove', () => {
    it('Should return true in case of it is guards turn and guards registered', async () => {
      const guardDetection = new TestGuardDetection(
        handler,
        config,
        tssHandler
      );
      jest.useFakeTimers().setSystemTime(1000 * 60 * 4 + 59 * 1000);
      jest
        .spyOn(guardDetection as any, 'generateNonce')
        .mockReturnValue('nonce');
      guardDetection.setGuardsInfo(
        {
          nonce: 'nonce',
          lastUpdate: Date.now() - 50 * 1000,
          peerId: '',
          publicKey: guardsPublicKeys[1],
          recognitionPromises: [],
        },
        0
      );
      guardDetection.setGuardsInfo(
        {
          nonce: 'nonce',
          lastUpdate: Date.now() - 50 * 1000,
          peerId: '',
          publicKey: guardsPublicKeys[2],
          recognitionPromises: [],
        },
        1
      );
      const result = guardDetection.getRegisterAndWaitForApprove(
        [0, 1],
        ['peerId0', 'peerId1']
      );

      const payload: ApprovePayload = {
        nonce: 'new nonce',
        receivedNonce: 'nonce',
        timestamp: Date.now(),
      };
      await guardDetection.getHandleApproveMessage(
        payload,
        guardsPublicKeys[1],
        'peerId0'
      );
      await guardDetection.getHandleApproveMessage(
        payload,
        guardsPublicKeys[2],
        'peerId1'
      );

      expect(await result).toBe(true);
    });

    it('Should return false in case of it is guards turn and not all guards registered', async () => {
      const guardDetection = new TestGuardDetection(
        handler,
        config,
        tssHandler
      );
      jest.useFakeTimers().setSystemTime(1000 * 60 * 4 + 59 * 1000);
      jest
        .spyOn(guardDetection as any, 'generateNonce')
        .mockReturnValue('nonce');
      guardDetection.setGuardsInfo(
        {
          nonce: 'nonce',
          lastUpdate: Date.now() - 50 * 1000,
          peerId: '',
          publicKey: guardsPublicKeys[1],
          recognitionPromises: [],
        },
        0
      );
      guardDetection.setGuardsInfo(
        {
          nonce: 'nonce',
          lastUpdate: Date.now() - 50 * 1000,
          peerId: '',
          publicKey: guardsPublicKeys[2],
          recognitionPromises: [],
        },
        1
      );
      const result = guardDetection.getRegisterAndWaitForApprove(
        [0, 1],
        ['peerId0', 'peerId1']
      );

      const payload: ApprovePayload = {
        nonce: 'new nonce',
        receivedNonce: 'nonce',
        timestamp: Date.now(),
      };
      await guardDetection.getHandleApproveMessage(
        payload,
        guardsPublicKeys[1],
        'peerId0'
      );
      jest.runAllTimers();
      expect(await result).toBe(false);
    });

    it('Should return false in case of it is not guard turn', async () => {
      const guardDetection = new TestGuardDetection(
        handler,
        config,
        tssHandler
      );
      jest.useFakeTimers().setSystemTime(1000 * 60 * 4 + 61 * 1000);
      const result = guardDetection.getRegisterAndWaitForApprove(
        [0, 1],
        ['peerId0', 'peerId1']
      );
      expect(await result).toBe(false);
    });
  });

  describe('handleSignMessage', () => {
    it('Should check TSS Sign if true then add payload message to payloadToSignMap', async () => {
      const guardDetection = new TestGuardDetection(
        handler,
        config,
        tssHandler
      );
      jest.spyOn(guardDetection as any, 'checkTssSign').mockReturnValue(true);
      const payload: SignPayload = {
        payload: 'payload',
        sign: 'sign',
        timestamp: Date.now(),
      };
      guardDetection.setPayloadToSignMap('payload', {
        active: ['publicKey1'],
        signed: [],
      });
      await guardDetection.getHandleSignMessage(
        payload,
        'publicKey1',
        'peerId1'
      );
      expect(guardDetection.getPayloadToSignMap().get('payload')).toEqual({
        active: ['publicKey1'],
        signed: [{ publicKey: 'publicKey1', sign: 'sign' }],
      });
    });

    it('Should check TSS Sign if false should not save sign', async () => {
      const guardDetection = new TestGuardDetection(
        handler,
        config,
        tssHandler
      );
      jest.spyOn(guardDetection as any, 'checkTssSign').mockReturnValue(false);
      const payload: SignPayload = {
        payload: 'payload',
        sign: 'sign',
        timestamp: Date.now(),
      };
      guardDetection.setPayloadToSignMap('payload', {
        active: ['publicKey1'],
        signed: [],
      });
      await guardDetection.getHandleSignMessage(
        payload,
        'publicKey1',
        'peerId1'
      );
      expect(guardDetection.getPayloadToSignMap().get('payload')).toEqual({
        active: ['publicKey1'],
        signed: [],
      });
    });

    it(
      'Should check TSS Sign if true and payload signed is more than equal to minimumSigner and if' +
        ' it is guards turn and have time remain to Sign more than minimumTimeRemainedToSign should' +
        ' broadcast sign message to active guards and should send to requestSignToTss',
      async () => {
        const guardDetection = new TestGuardDetection(
          handler,
          config,
          tssHandler
        );
        jest.useFakeTimers().setSystemTime(1000 * 60 * 4 + 49 * 1000);
        jest.spyOn(guardDetection as any, 'checkTssSign').mockReturnValue(true);
        const spiedBroadcastSign = jest.spyOn(
          guardDetection as any,
          'broadcastSign'
        );
        const spiedRequestSignToTss = jest.spyOn(
          guardDetection as any,
          'requestSignToTss'
        );
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
            nonce: 'nonce2',
            lastUpdate: Date.now(),
            peerId: 'peerId2',
            publicKey: guardsPublicKeys[2],
            recognitionPromises: [],
          },
          1
        );
        const payload: SignPayload = {
          payload: 'payload',
          sign: 'sign',
          timestamp: Date.now(),
        };
        guardDetection.setPayloadToSignMap('payload', {
          active: [guardsPublicKeys[1], guardsPublicKeys[2]],
          signed: [{ publicKey: guardsPublicKeys[2], sign: 'sign2' }],
        });
        await guardDetection.getHandleSignMessage(
          payload,
          guardsPublicKeys[1],
          'peerId'
        );
        expect(spiedBroadcastSign).toHaveBeenCalledWith('payload', [
          { publicKey: guardsPublicKeys[2], sign: 'sign2' },
          { publicKey: guardsPublicKeys[1], sign: 'sign' },
        ]);
        expect(spiedRequestSignToTss).toHaveBeenCalledWith('payload');
      }
    );

    it(
      'Should check TSS Sign if true and payload signed is more than equal to minimumSigner and if' +
        ' it is guards turn and have time remain to Sign less than minimumTimeRemainedToSign should' +
        'not broadcast sign message to active guards and should not send to requestSignToTss',
      async () => {
        const guardDetection = new TestGuardDetection(
          handler,
          config,
          tssHandler
        );
        jest.useFakeTimers().setSystemTime(1000 * 60 * 4 + 51 * 1000);
        jest.spyOn(guardDetection as any, 'checkTssSign').mockReturnValue(true);
        const spiedBroadcastSign = jest.spyOn(
          guardDetection as any,
          'broadcastSign'
        );
        const spiedRequestSignToTss = jest.spyOn(
          guardDetection as any,
          'requestSignToTss'
        );
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
            nonce: 'nonce2',
            lastUpdate: Date.now(),
            peerId: 'peerId2',
            publicKey: guardsPublicKeys[2],
            recognitionPromises: [],
          },
          1
        );
        const payload: SignPayload = {
          payload: 'payload',
          sign: 'sign',
          timestamp: Date.now(),
        };
        guardDetection.setPayloadToSignMap('payload', {
          active: [guardsPublicKeys[1], guardsPublicKeys[2]],
          signed: [{ publicKey: guardsPublicKeys[2], sign: 'sign2' }],
        });
        await guardDetection.getHandleSignMessage(
          payload,
          guardsPublicKeys[1],
          'peerId'
        );
        expect(spiedBroadcastSign).not.toHaveBeenCalled();
        expect(spiedRequestSignToTss).not.toHaveBeenCalled();
      }
    );

    it(
      'Should check TSS Sign if true and payload signed is not more than or equal to minimumSigner' +
        ' should not broadcast sign message to active guards and should not send to requestSignToTss',
      async () => {
        const guardDetection = new TestGuardDetection(
          handler,
          config,
          tssHandler
        );
        jest.useFakeTimers().setSystemTime(1000 * 60 * 4 + 49 * 1000);
        jest.spyOn(guardDetection as any, 'checkTssSign').mockReturnValue(true);
        const spiedBroadcastSign = jest.spyOn(
          guardDetection as any,
          'broadcastSign'
        );
        const spiedRequestSignToTss = jest.spyOn(
          guardDetection as any,
          'requestSignToTss'
        );
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
            nonce: 'nonce2',
            lastUpdate: Date.now(),
            peerId: 'peerId2',
            publicKey: guardsPublicKeys[2],
            recognitionPromises: [],
          },
          1
        );
        const payload: SignPayload = {
          payload: 'payload',
          sign: 'sign',
          timestamp: Date.now(),
        };
        guardDetection.setPayloadToSignMap('payload', {
          active: [guardsPublicKeys[1], guardsPublicKeys[2]],
          signed: [],
        });
        await guardDetection.getHandleSignMessage(
          payload,
          guardsPublicKeys[1],
          'peerId'
        );
        expect(spiedBroadcastSign).not.toHaveBeenCalled();
        expect(spiedRequestSignToTss).not.toHaveBeenCalled();
      }
    );
  });

  describe('sendSignMessage', () => {
    it('Should send sign message to peerId', async () => {
      const guardDetection = new TestGuardDetection(
        handler,
        config,
        tssHandler
      );
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
      await guardDetection.getSendSignMessage(0, {
        payload: 'payload',
        sign: 'sign',
      });
      expect(handler.send).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'sign',
          pk: guardsPublicKeys[0],
          payload: expect.stringContaining(
            '{"payload":"payload","sign":"sign","timestamp"'
          ),
          signature: 'signature',
          receiver: guardsPublicKeys[1],
        })
      );
    });
  });

  describe('sendRequestToSignMessage', () => {
    it('Should send request to sign message to peerId', async () => {
      const guardDetection = new TestGuardDetection(
        handler,
        config,
        tssHandler
      );
      guardDetection.setGuardsInfo(
        {
          nonce: 'nonce',
          lastUpdate: Date.now(),
          peerId: 'peerId',
          publicKey: 'publicKey1',
          recognitionPromises: [],
        },
        0
      );
      await guardDetection.getSendRequestToSignMessage(0, {
        payload: 'payload',
        activeGuards: [{ publicKey: 'publicKey1', peerId: 'peerId' }],
      });
      expect(handler.send).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'requestToSign',
          pk: guardsPublicKeys[0],
          payload: expect.stringContaining(
            '{"payload":"payload","activeGuards":[{"publicKey":"publicKey1","peerId":"peerId"}],"timestamp"'
          ),
          signature: 'signature',
          receiver: 'publicKey1',
        })
      );
    });
  });

  describe('handleRequestToSignMessage', () => {
    it('Should check if payload is valid and then send request to sign message to guards that are in active list', async () => {
      const guardDetection = new TestGuardDetection(
        handler,
        config,
        tssHandler
      );
      jest
        .spyOn(guardDetection as any, 'isPayloadValidToSign')
        .mockReturnValue(true);
      jest
        .spyOn(guardDetection as any, 'getActiveGuards')
        .mockReturnValue([{ publicKey: 'publicKey1', peerId: 'peerId1' }]);
      const spiedSendSignMessage = jest.spyOn(
        guardDetection as any,
        'sendSignMessage'
      );
      const message: RequestToSignPayload = {
        payload: 'payload',
        activeGuards: [{ publicKey: 'publicKey1', peerId: 'peerId1' }],
        timestamp: Date.now(),
      };
      guardDetection.setGuardsInfo(
        {
          nonce: 'nonce2',
          lastUpdate: Date.now(),
          peerId: 'peerId2',
          publicKey: 'publicKey2',
          recognitionPromises: [],
        },
        1
      );
      await guardDetection.getHandleRequestToSignMessage(message, 'publicKey2');
      expect(spiedSendSignMessage).toHaveBeenCalledTimes(1);
    });

    it('Should check if payload is not should not send anything', async () => {
      const guardDetection = new TestGuardDetection(
        handler,
        config,
        tssHandler
      );
      jest
        .spyOn(guardDetection as any, 'isPayloadValidToSign')
        .mockReturnValue(false);
      jest
        .spyOn(guardDetection as any, 'getActiveGuards')
        .mockReturnValue([{ publicKey: 'publicKey1', peerId: 'peerId1' }]);
      const spiedSendSignMessage = jest.spyOn(
        guardDetection as any,
        'sendSignMessage'
      );
      const message: RequestToSignPayload = {
        payload: 'payload',
        activeGuards: [{ publicKey: 'publicKey1', peerId: 'peerId1' }],
        timestamp: Date.now(),
      };
      guardDetection.setGuardsInfo(
        {
          nonce: 'nonce2',
          lastUpdate: Date.now(),
          peerId: 'peerId2',
          publicKey: 'publicKey2',
          recognitionPromises: [],
        },
        1
      );
      await guardDetection.getHandleRequestToSignMessage(message, 'publicKey2');
      expect(spiedSendSignMessage).toHaveBeenCalledTimes(0);
    });

    it('Should check if payload is valid and guard is not registered so should register guards first and then send sign message', async () => {
      const guardDetection = new TestGuardDetection(
        handler,
        config,
        tssHandler
      );
      jest
        .spyOn(guardDetection as any, 'isPayloadValidToSign')
        .mockReturnValue(true);
      jest
        .spyOn(guardDetection as any, 'getActiveGuards')
        .mockReturnValue([{ publicKey: 'publicKey1', peerId: 'peerId1' }]);
      const spiedSendSignMessage = jest.spyOn(
        guardDetection as any,
        'sendSignMessage'
      );
      const spiedRegisterAndWaitForApprove = jest.spyOn(
        guardDetection as any,
        'registerAndWaitForApprove'
      );
      spiedRegisterAndWaitForApprove.mockReturnValue(Promise.resolve(true));
      const message: RequestToSignPayload = {
        payload: 'payload',
        activeGuards: [],
        timestamp: Date.now(),
      };
      guardDetection.setGuardsInfo(
        {
          nonce: 'nonce2',
          lastUpdate: Date.now(),
          peerId: 'peerId2',
          publicKey: 'publicKey2',
          recognitionPromises: [],
        },
        1
      );
      await guardDetection.getHandleRequestToSignMessage(message, 'publicKey2');
      expect(spiedRegisterAndWaitForApprove).toHaveBeenCalledTimes(1);
      expect(spiedSendSignMessage).toHaveBeenCalledTimes(1);
    });
  });
});
