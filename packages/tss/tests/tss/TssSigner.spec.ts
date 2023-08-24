import { ActiveGuard, EdDSA, GuardDetection, StatusEnum } from '../../lib';
import { TestTssSigner } from './TestTssSigner';
import { generateSigners } from '../testUtils';
import {
  approveMessage,
  requestMessage,
  startMessage,
} from '../../lib/const/signer';

describe('TssSigner', () => {
  let signer: TestTssSigner;
  let mockSubmit = jest.fn();
  let guardSigners: Array<EdDSA>;
  let detection: GuardDetection;
  const currentTime = 1686286005068;
  const timestamp = Math.floor(currentTime / 1000);

  beforeEach(async () => {
    const signers = await generateSigners();
    guardSigners = signers.guardSigners;
    jest.restoreAllMocks();
    jest.spyOn(Date, 'now').mockReturnValue(currentTime);
    mockSubmit = jest.fn();
    detection = new GuardDetection({
      signer: guardSigners[0],
      guardsPublicKey: signers.guardPks,
      submit: mockSubmit,
      getPeerId: () => Promise.resolve('myPeerId'),
    });
    signer = new TestTssSigner({
      submitMsg: mockSubmit,
      callbackUrl: '',
      signer: guardSigners[0],
      detection: detection,
      guardsPk: signers.guardPks,
      tssApiUrl: '',
      getPeerId: () => Promise.resolve('myPeerId'),
      shares: signers.guardPks,
    });
    jest
      .spyOn((signer as any).axios, 'get')
      .mockResolvedValue({ data: { threshold: 6 } });
    (signer as any).cacheThreshold = {
      threshold: 7,
      expiry: 0,
    };
  });

  describe('cleanup', () => {
    /**
     * @target TssSigner.cleanup should remove timed out signs
     * @dependencies
     * @scenario
     * - mock `Date.now` to return 1686286005068 ( a random timestamp )
     * - add one sign for 5 minute + 1 second before
     * - call cleanup
     * @expected
     * - signs must be empty array
     */
    it('should remove timed out signs', async () => {
      const signs = signer.getSigns();
      signs.push({
        msg: 'random msg',
        signs: [],
        addedTime: Math.floor(currentTime / 1000) - 5 * 60 - 1,
        callback: () => null,
        posted: false,
      });
      await (signer as any).cleanup();
      expect(signer.getSigns().length).toEqual(0);
    });

    /**
     * @target TssSigner.cleanup should not remove non-timed out signs
     * @dependencies
     * @scenario
     * - mock `Date.now` to return 1686286005068 ( a random timestamp )
     * - add one sign for 5 minute - 1 second before
     * - call cleanup
     * @expected
     * - signs must contain one element
     */
    it('should not remove non-timed out signs', async () => {
      const signs = signer.getSigns();
      signs.push({
        msg: 'random msg',
        signs: [],
        posted: false,
        addedTime: Math.floor(currentTime / 1000) - 5 * 60 + 1,
        callback: () => null,
      });
      await (signer as any).cleanup();
      expect(signer.getSigns().length).toEqual(1);
    });

    /**
     * @target TssSigner.cleanup should remove pending item which not in guards turn
     * @dependencies
     * @scenario
     * - mock `Date.now` to return 1686286005068 ( a random timestamp )
     * - add one pending sign for guard index 4 (current guard turn is 5)
     * - call cleanup
     * @expected
     * - pendingSign array must be empty
     */
    it('should remove pending item which not in guards turn', async () => {
      const pending = signer.getPendingSigns();
      pending.push({
        msg: 'random msg',
        index: 4,
        guards: [],
        timestamp: currentTime,
        sender: '',
      });
      await (signer as any).cleanup();
      expect(signer.getPendingSigns().length).toEqual(0);
    });

    /**
     * @target TssSigner.cleanup should not remove pending item which in guards turn
     * @dependencies
     * @scenario
     * - mock `Date.now` to return 1686286005068 ( a random timestamp )
     * - add one pending sign for guard index 5 (current guard turn)
     * - call cleanup
     * @expected
     * - pendingSign must contain one element
     */
    it('should not remove pending item which in guards turn', async () => {
      const pending = signer.getPendingSigns();
      pending.push({
        msg: 'random msg',
        index: 6,
        guards: [],
        timestamp: currentTime,
        sender: '',
      });
      await (signer as any).cleanup();
      expect(signer.getPendingSigns().length).toEqual(1);
    });
  });

  describe('update', () => {
    beforeEach(() => {
      signer.getSigns().push({
        posted: false,
        msg: 'random message',
        callback: jest.fn(),
        signs: [],
        addedTime: currentTime,
      });
    });
    /**
     * @target TssSigner.update should call cleanup
     * @dependencies
     * @scenario
     * - mock cleanup
     * - mock `Date.now` to return 1686286005068 ( a random timestamp )
     * @expected
     * - mocked cleanup must call once
     */
    it('should call cleanup', async () => {
      const mockedCleanup = jest
        .spyOn(signer as any, 'cleanup')
        .mockReturnValue(null);
      await signer.update();
      expect(mockedCleanup).toHaveBeenCalledTimes(1);
    });

    /**
     * @target TssSigner.update should not call sendMessage when it's not guard turn
     * @dependencies
     * @scenario
     * - mock activeGuards to return a list of 7 active guard
     * - mock `Date.now` to return 1686286005068 ( a random timestamp )
     * - call update
     * @expected
     * - mocked submitMsg must not call
     */
    it("should not call sendMessage when it's not guard turn", async () => {
      const activeGuards = Array(7)
        .fill('')
        .map((item, index) => ({
          peerId: `peerId-${index}`,
          publicKey: `publicKey-${index}`,
        }));
      jest.spyOn(detection, 'activeGuards').mockResolvedValue(activeGuards);
      await signer.update();
      expect(mockSubmit).not.toBeCalled();
    });

    /**
     * @target TssSigner.update should not call sendMessage when active guards list length lower than threshold
     * @dependencies
     * @scenario
     * - mock activeGuards to return a list of 6 active guard
     * - mock `Date.now` to return 1686285600 ( a random timestamp when its this guard turn)
     * - call update
     * @expected
     * - mocked submitMsg must not call
     */
    it('should not call sendMessage when active guards list length lower than threshold', async () => {
      jest.spyOn(Date, 'now').mockReturnValue(1686285600608);
      const activeGuards = Array(6)
        .fill('')
        .map((item, index) => ({
          peerId: `peerId-${index}`,
          publicKey: `publicKey-${index}`,
        }));
      jest.spyOn(detection, 'activeGuards').mockResolvedValue(activeGuards);
      await signer.update();
      expect(mockSubmit).not.toBeCalled();
    });

    /**
     * @target TssSigner.update should call once sendMessage when more than one time called
     * @dependencies
     * @scenario
     * - mock activeGuards to return a list of 7 active guard
     * - mock `Date.now` to return 1686285600 ( a random timestamp when its this guard turn)
     * - call update twice
     * @expected
     * - mocked submitMsg must call once
     */
    it('should call once sendMessage when more than one time called', async () => {
      jest.spyOn(Date, 'now').mockReturnValue(1686285600608);
      const activeGuards = Array(7)
        .fill('')
        .map((item, index) => ({
          peerId: `peerId-${index}`,
          publicKey: `publicKey-${index}`,
        }));
      jest.spyOn(detection, 'activeGuards').mockResolvedValue(activeGuards);
      await signer.update();
      await signer.update();
      expect(mockSubmit).toHaveBeenCalledTimes(1);
    });

    /**
     * @target TssSigner.update should update sings array
     * @dependencies
     * @scenario
     * - mock activeGuards to return a list of 7 active guard
     * - mock `Date.now` to return 1686285600 ( a random timestamp when its this guard turn)
     * - call update twice
     * @expected
     * - signs array must be a list of 10 element
     * - only first element must have value
     */
    it('should update sings array', async () => {
      jest.spyOn(Date, 'now').mockReturnValue(1686285600608);
      const activeGuards = Array(7)
        .fill('')
        .map((item, index) => ({
          peerId: `peerId-${index}`,
          publicKey: `publicKey-${index}`,
        }));
      jest.spyOn(detection, 'activeGuards').mockResolvedValue(activeGuards);
      await signer.update();
      const signs = signer.getSigns()[0].signs;
      expect(signs.length).toEqual(10);
      expect(signs.filter((item) => item !== '').length).toEqual(1);
      expect(signs[0]).not.toEqual('');
    });
  });

  describe('getGuardTurn', () => {
    /**
     * @target TssSigner.getGuardTurn should return guard index turn
     * @dependencies
     * @scenario
     * - mock `Date.now` to return 1686286005068 ( a random timestamp )
     * @expected
     * - must return 6
     */
    it('should return guard index turn', () => {
      expect(signer.getGuardTurn()).toEqual(6);
    });
  });

  describe('isNoWorkTime', () => {
    /**
     * @target TssSigner.isNoWorkTime should return false when remain more than NoWork seconds
     * @dependencies
     * @scenario
     * - mock `Date.now` to return 1686285606068 (beginning of turn)
     * - call isNoWorkTime
     * @expected
     * - must return false
     */
    it('should return false when remain more than NoWork seconds', () => {
      const currentTime = 1686285606068;
      jest.spyOn(Date, 'now').mockReturnValue(currentTime);
      expect(signer.mockedIsNoWorkTime()).toBeFalsy();
    });

    /**
     * @target TssSigner.isNoWorkTime should return false when remain more than NoWork seconds
     * @dependencies
     * @scenario
     * - mock `Date.now` to return 1686285651068 (9 seconds to end of turn noWorkTurn is 10)
     * - call isNoWorkTime
     * @expected
     * - must return true
     */
    it('should return true when remain less than NoWork seconds', () => {
      const currentTime = 1686285651068;
      jest.spyOn(Date, 'now').mockReturnValue(currentTime);
      expect(signer.mockedIsNoWorkTime()).toBeTruthy();
    });
  });

  describe('sign', () => {
    /**
     * @target TssSigner.sign should add new sign to list
     * @dependencies
     * @scenario
     * - call sign
     * @expected
     * - an element with entered msg must add to sign list
     */
    it('should add new sign to list', async () => {
      await signer.sign('msg', jest.fn());
      expect(
        signer.getSigns().filter((item) => item.msg === 'msg').length
      ).toEqual(1);
    });

    /**
     * @target TssSigner.sign should call handleRequestMessage if msg in pending state
     * @dependencies
     * @scenario
     * - call sign
     * @expected
     * - an element with entered msg must add to sign list
     */
    it('should call handleRequestMessage if msg in pending state', async () => {
      const pending = signer.getPendingSigns();
      pending.push({
        msg: 'signing message',
        guards: [],
        index: 6,
        sender: 'sender',
        timestamp: currentTime,
      });
      const mockedHandleRequest = jest
        .spyOn(signer as any, 'handleRequestMessage')
        .mockReturnValue(null);
      await signer.sign('signing message', jest.fn());
      expect(mockedHandleRequest).toHaveBeenCalledTimes(1);
      expect(mockedHandleRequest).toHaveBeenCalledWith(
        {
          msg: 'signing message',
          guards: [],
        },
        'sender',
        6,
        currentTime
      );
    });
  });

  describe('processMessage', () => {
    /**
     * @target TssSigner.processMessage should call handleRequestMessage
     * when message type is requestMessage
     * @dependencies
     * @scenario
     * - mock handleRequestMessage
     * - call processMessage
     * @expected
     * - mocked function must call with expected arguments
     */
    it('should call handleRequestMessage when message type is requestMessage', async () => {
      const mockedFn = ((signer as any).handleRequestMessage = jest.fn());
      await signer.processMessage(requestMessage, {}, '', 1, 'peerId', 1234);
      expect(mockedFn).toHaveBeenCalledTimes(1);
      expect(mockedFn).toHaveBeenCalledWith({}, 'peerId', 1, 1234);
    });

    /**
     * @target TssSigner.processMessage should call handleApproveMessage
     * when message type is approveMessage
     * @dependencies
     * @scenario
     * - mock handleApproveMessage
     * - call processMessage
     * @expected
     * - mocked function must call with expected arguments
     */
    it('should call handleApproveMessage when message type is approveMessage', async () => {
      const mockedFn = ((signer as any).handleApproveMessage = jest.fn());
      await signer.processMessage(
        approveMessage,
        {},
        'sign',
        1,
        'peerId',
        1234
      );
      expect(mockedFn).toHaveBeenCalledTimes(1);
      expect(mockedFn).toHaveBeenCalledWith({}, 'peerId', 1, 'sign');
    });

    /**
     * @target GuardDetection.processMessage should call handleStartMessage
     * when message type is startMessage
     * @dependencies
     * @scenario
     * - mock handleApproveMessage
     * - call processMessage
     * @expected
     * - mocked function must call with expected arguments
     */
    it('should call handleStartMessage when message type is startMessage', async () => {
      const mockedFn = ((signer as any).handleStartMessage = jest.fn());
      await signer.processMessage(startMessage, {}, '', 1, 'peerId', 1234);
      expect(mockedFn).toHaveBeenCalledTimes(1);
      expect(mockedFn).toHaveBeenCalledWith({}, 1234, 1, 'peerId');
    });
  });

  describe('getUnknownGuards', () => {
    /**
     * @target GuardDetection.getUnknownGuards should return list of unknown guards
     * @dependencies
     * @scenario
     * - mock detection to return known list of guards
     * - call getUnknownGuards with one unknown guard
     * @expected
     * - must return unknown guard
     */
    it('should return list of unknown guards', async () => {
      const myActiveGuards = [
        { peerId: 'peerId-1', publicKey: await guardSigners[1].getPk() },
        { peerId: 'peerId-2', publicKey: await guardSigners[2].getPk() },
        { peerId: 'peerId-3', publicKey: await guardSigners[3].getPk() },
      ];
      const unknownGuard = {
        peerId: 'peerId-4',
        publicKey: await guardSigners[4].getPk(),
      };
      const requestedGuard = [...myActiveGuards, unknownGuard];
      jest.spyOn(detection, 'activeGuards').mockResolvedValue(myActiveGuards);
      const unknownGuards = await signer.mockedGetUnknownGuards(requestedGuard);
      expect(unknownGuards).toEqual([unknownGuard]);
    });
  });

  describe('getInvalidGuards', () => {
    /**
     * @target GuardDetection.getInvalidGuards should return list of invalid guards
     * @dependencies
     * @scenario
     * - mock detection to return known list of guards
     * - call getInvalidGuards with one guard with different peerId
     * @expected
     * - must return selected guard
     */
    it('should return list of unknown guards', async () => {
      const myActiveGuards = [
        { peerId: 'peerId-1', publicKey: await guardSigners[1].getPk() },
        { peerId: 'peerId-2', publicKey: await guardSigners[2].getPk() },
        { peerId: 'peerId-3', publicKey: await guardSigners[3].getPk() },
      ];
      const invalidGuard = {
        peerId: 'peerId-3-new',
        publicKey: await guardSigners[3].getPk(),
      };
      const requestedGuard = [...myActiveGuards.slice(0, 2), invalidGuard];
      jest.spyOn(detection, 'activeGuards').mockResolvedValue(myActiveGuards);
      const unknownGuards = await signer.mockedGetInvalidGuards(requestedGuard);
      expect(unknownGuards).toEqual([invalidGuard]);
    });
  });

  describe('handleRequestMessage', () => {
    let activeGuards: Array<ActiveGuard>;
    beforeEach(async () => {
      activeGuards = [
        { peerId: 'peerId-1', publicKey: await guardSigners[1].getPk() },
        { peerId: 'peerId-2', publicKey: await guardSigners[2].getPk() },
        { peerId: 'peerId-3', publicKey: await guardSigners[3].getPk() },
      ];
      jest.spyOn(detection, 'activeGuards').mockResolvedValue(activeGuards);
      signer.getSigns().push({
        msg: 'test message',
        signs: [],
        addedTime: currentTime,
        callback: jest.fn(),
        posted: false,
      });
    });
    /**
     * @target GuardDetection.handleRequestMessage should send approve message when all conditions are OK
     * @dependencies
     * @scenario
     * - mock a list of active guards
     * - add a sign to signs list of signer
     * - call handleRequestMessage
     * @expected
     * - send message called once with
     *   - second argument with ['sender']
     *   - first argument is a json
     *     - type is approveMessage
     *     - payload as expected
     *     - timestamp same as called timestamp
     */
    it('should send approve message when all conditions are OK', async () => {
      await signer.mockedHandleRequestMessage(
        {
          msg: 'test message',
          guards: activeGuards,
        },
        'sender',
        6,
        timestamp,
        true
      );
      expect(mockSubmit).toHaveBeenCalledTimes(1);
      expect(mockSubmit).toHaveBeenCalledWith(expect.any(String), ['sender']);
      const msg = JSON.parse(mockSubmit.mock.calls[0][0]);
      expect(msg.type).toEqual(approveMessage);
      expect(msg.payload).toEqual({
        msg: 'test message',
        guards: activeGuards,
        initGuardIndex: 6,
      });
      expect(msg.timestamp).toEqual(timestamp);
    });

    /**
     * @target GuardDetection.handleRequestMessage should not send any message when it's not guard turn
     * @dependencies
     * @scenario
     * - mock a list of active guards
     * - add a sign to signs list of signer
     * - call handleRequestMessage with invalid guard index turn
     * @expected
     * - mockSubmit must not call
     */
    it("should not send any message when it's not guard turn", async () => {
      await signer.mockedHandleRequestMessage(
        {
          msg: 'test message',
          guards: activeGuards,
        },
        'sender',
        5,
        timestamp,
        true
      );
      expect(mockSubmit).toHaveBeenCalledTimes(0);
    });

    /**
     * @target GuardDetection.handleRequestMessage should not send any message when at least one of guards are invalid
     * @dependencies
     * @scenario
     * - mock a list of active guards
     * - add a sign to signs list of signer
     * - create guards list with invalid peedId for index 2
     * - call handleRequestMessage
     * @expected
     * - mockSubmit must not call
     */
    it("should not send any message when it's not guard turn", async () => {
      const invalidGuards = [...activeGuards];
      invalidGuards[2] = { ...invalidGuards[2], peerId: 'invalid peer id' };
      await signer.mockedHandleRequestMessage(
        {
          msg: 'test message',
          guards: invalidGuards,
        },
        'sender',
        6,
        timestamp,
        true
      );
      expect(mockSubmit).toHaveBeenCalledTimes(0);
    });

    /**
     * @target GuardDetection.handleRequestMessage should store request and send register to unknown guard
     * @dependencies
     * @scenario
     * - mock a list of active guards
     * - mock register of detection
     * - add a sign to signs list of signer
     * - call handleRequestMessage with new guard added to list
     * - after it mock handleRequestMessage
     * - then call callBack passed to register function
     * @expected
     * - mockSubmit must not call
     * - mockedRegister must call once with 'peerId-4' and its publicKey
     * - after calling callBack it must call handleRequestMessage once with same argument passed to it first
     */
    it('should store request and send register to unknown guard', async () => {
      const mockedRegister = jest
        .spyOn(detection, 'register')
        .mockResolvedValue();
      const guards = [
        ...activeGuards,
        { peerId: 'peerId-4', publicKey: await guardSigners[4].getPk() },
      ];
      const payload = {
        msg: 'test message',
        guards: guards,
      };
      await signer.mockedHandleRequestMessage(
        payload,
        'sender',
        6,
        timestamp,
        true
      );
      expect(mockedRegister).toHaveBeenCalledTimes(1);
      expect(mockSubmit).toHaveBeenCalledTimes(0);
      expect(mockedRegister).toHaveBeenCalledWith(
        'peerId-4',
        await guardSigners[4].getPk(),
        expect.anything()
      );
      const callback = mockedRegister.mock.calls[0][2];
      const mocked = jest
        .spyOn(signer as any, 'handleRequestMessage')
        .mockResolvedValue(null);
      await callback(true);
      expect(mocked).toHaveBeenCalledTimes(1);
      expect(mocked).toHaveBeenCalledWith(
        payload,
        'sender',
        6,
        timestamp,
        false
      );
    });

    /**
     * @target GuardDetection.handleRequestMessage should do nothing when unknown guard exists and sendRegister is false
     * @dependencies
     * @scenario
     * - mock a list of active guards
     * - mock register of detection
     * - add a sign to signs list of signer
     * - call handleRequestMessage with new guard added to list and sendRegister=false
     * @expected
     * - mockSubmit must not call
     * - mockedRegister must not call
     */
    it('should do nothing when unknown guard exists and sendRegister is false', async () => {
      const mockedRegister = jest
        .spyOn(detection, 'register')
        .mockResolvedValue();
      const payload = {
        msg: 'test message',
        guards: [
          ...activeGuards,
          { peerId: 'peerId-4', publicKey: await guardSigners[4].getPk() },
        ],
      };
      await signer.mockedHandleRequestMessage(
        payload,
        'sender',
        6,
        timestamp,
        false
      );
      expect(mockedRegister).toHaveBeenCalledTimes(0);
      expect(mockSubmit).toHaveBeenCalledTimes(0);
    });

    /**
     * @target GuardDetection.handleRequestMessage should add pendingSign when sign does not exist and do nothing
     * @dependencies
     * @scenario
     * - mock a list of active guards
     * - mock register of detection
     * - add a sign to signs list of signer
     * - call handleRequestMessage with new msg
     * @expected
     * - mockSubmit must not call
     * - mockedRegister must not call
     * - pendingSign must contain one element with passed arguments
     */
    it('should add pendingSign when sign does not exist and do nothing', async () => {
      const mockedRegister = jest
        .spyOn(detection, 'register')
        .mockResolvedValue();
      const payload = {
        msg: 'test message new',
        guards: activeGuards,
      };
      await signer.mockedHandleRequestMessage(
        payload,
        'sender',
        6,
        timestamp,
        false
      );
      expect(mockedRegister).toHaveBeenCalledTimes(0);
      expect(mockSubmit).toHaveBeenCalledTimes(0);
      const pending = signer.getPendingSigns();
      expect(pending).toEqual([
        {
          guards: activeGuards,
          index: 6,
          msg: 'test message new',
          sender: 'sender',
          timestamp,
        },
      ]);
    });

    /**
     * @target GuardDetection.handleRequestMessage should update pending sign request and do nothing
     * @dependencies
     * @scenario
     * - mock a list of active guards
     * - mock register of detection
     * - add selected message to pending list
     * - add a sign to signs list of signer
     * - call handleRequestMessage with new msg
     * @expected
     * - mockSubmit must not call
     * - mockedRegister must not call
     * - pendingSign must be updated with new data
     */
    it('should update pending sign request and do nothing', async () => {
      const mockedRegister = jest
        .spyOn(detection, 'register')
        .mockResolvedValue();
      const payload = {
        msg: 'test message new',
        guards: activeGuards,
      };
      const pendings = signer.getPendingSigns();
      pendings.push({
        msg: 'test message new',
        guards: [],
        index: 0,
        timestamp: 0,
        sender: 'sender old',
      });
      await signer.mockedHandleRequestMessage(
        payload,
        'sender',
        6,
        timestamp,
        false
      );
      expect(mockedRegister).toHaveBeenCalledTimes(0);
      expect(mockSubmit).toHaveBeenCalledTimes(0);
      const pending = signer.getPendingSigns();
      expect(pending).toEqual([
        {
          guards: activeGuards,
          index: 6,
          msg: 'test message new',
          sender: 'sender',
          timestamp,
        },
      ]);
    });
  });

  describe('getSign', () => {
    /**
     * @target GuardDetection.getSign should return sign instance from list
     * @dependencies
     * @scenario
     * - mock signs array to contain one element with `msg1` as msg
     * - call getSign
     * @expected
     * - must sign instance with `msg1` as its msg
     */
    it('should return sign instance from list', () => {
      const signs = signer.getSigns();
      signs.push({
        msg: 'msg1',
        signs: [],
        addedTime: currentTime,
        callback: jest.fn,
        posted: false,
      });
      const sign = signer.mockedGetSign('msg1');
      expect(sign).toBeDefined();
      expect(sign?.msg).toEqual('msg1');
    });

    /**
     * @target GuardDetection.getSign should return undefined when sign not exists
     * @dependencies
     * @scenario
     * - mock signs array to contain one element with `msg1` as msg
     * - call getSign with `msg2`
     * @expected
     * - must return undefined
     */
    it('should return undefined when sign not exists', () => {
      const signs = signer.getSigns();
      signs.push({
        msg: 'msg1',
        signs: [],
        addedTime: currentTime,
        callback: jest.fn,
        posted: false,
      });
      const sign = signer.mockedGetSign('msg2');
      expect(sign).toBeUndefined();
    });
  });

  describe('getPendingSign', () => {
    /**
     * @target GuardDetection.getPendingSign should return pendingSign instance from list
     * @dependencies
     * @scenario
     * - mock pendingSigns array to contain one element with `msg1` as msg
     * - call getPendingSign
     * @expected
     * - must pendingSign instance with `msg1` as its msg
     */
    it('should return pendingSign instance from list', () => {
      const pending = signer.getPendingSigns();
      pending.push({
        msg: 'msg1',
        index: 2,
        guards: [],
        timestamp: currentTime,
        sender: 'sender',
      });
      const sign = signer.mockedGetPendingSign('msg1');
      expect(sign).toBeDefined();
      expect(sign?.msg).toEqual('msg1');
    });

    /**
     * @target GuardDetection.getPendingSign should return undefined when pendingSign not exists
     * @dependencies
     * @scenario
     * - mock pendingSign array to contain one element with `msg1` as msg
     * - call getPendingSign with `msg2`
     * @expected
     * - must return undefined
     */
    it('should return undefined when pendingSign not exists', () => {
      const pending = signer.getPendingSigns();
      pending.push({
        msg: 'msg1',
        index: 2,
        guards: [],
        timestamp: currentTime,
        sender: 'sender',
      });
      const sign = signer.mockedGetSign('msg2');
      expect(sign).toBeUndefined();
    });
  });

  describe('handleApproveMessage', () => {
    let activeGuards: Array<ActiveGuard>;
    beforeEach(async () => {
      activeGuards = [
        { peerId: 'peerId-1', publicKey: await guardSigners[1].getPk() },
        { peerId: 'peerId-2', publicKey: await guardSigners[2].getPk() },
        { peerId: 'peerId-3', publicKey: await guardSigners[3].getPk() },
      ];
      signer.getSigns().push({
        msg: 'test message',
        signs: Array(10).fill(''),
        addedTime: timestamp,
        callback: jest.fn(),
        request: {
          index: 0,
          guards: activeGuards,
          timestamp,
        },
        posted: false,
      });
    });

    /**
     * @target GuardDetection.handleApproveMessage should add guard sign to sign object
     * when all conditions are met and signs are not enough
     * @dependencies
     * @scenario
     * - mock EdDSA signer to approve signatures
     * - add sign instance to list with valid request and empty list of signs
     * - call handleApproveMessage
     * @expected
     * - mockSubmit must not call
     * - inserted sign must contain new signature only
     */
    it('should add guard sign to sign object when all conditions are met and signs are not enough', async () => {
      jest.spyOn(guardSigners[0], 'verify').mockResolvedValue(true);
      await signer.mockedHandleApproveMessage(
        {
          msg: 'test message',
          guards: activeGuards,
          initGuardIndex: 0,
        },
        'peerId-2',
        2,
        'random signature'
      );
      const sign = signer.getSigns()[0];
      expect(sign.signs).toEqual(
        Array(10)
          .fill('')
          .map((item, index) => (index === 2 ? 'random signature' : ''))
      );
      expect(mockSubmit).not.toHaveBeenCalled();
    });

    /**
     * @target GuardDetection.handleApproveMessage should call start sign
     * and send sign message when signature are enough
     * @dependencies
     * @scenario
     * - add sign instance to list with valid request and empty list of 6 signatures
     * - mock EdDsa verify to return true
     * - mock startSign method
     * - call handleApproveMessage
     * @expected
     * - mockedStartSign must call
     * - mockSubmit must call with start sign message
     */
    it('should call start sign and send sign message when signature are enough', async () => {
      activeGuards = await Promise.all(
        Array(7)
          .fill('')
          .map(async (item, index) => ({
            peerId: `peerId-${index}`,
            publicKey: await guardSigners[index].getPk(),
          }))
      );
      jest
        .spyOn(signer as any, 'getApprovedGuards')
        .mockResolvedValue(activeGuards);
      const sign = signer.getSigns()[0];
      sign.request = {
        guards: activeGuards,
        timestamp: timestamp,
        index: 0,
      };
      sign.signs = sign.signs.map((item, index) =>
        index < 6 ? `random signature ${index}` : ''
      );
      const mockedStartSign = jest
        .spyOn(signer, 'startSign')
        .mockResolvedValue();
      await signer.mockedHandleApproveMessage(
        {
          msg: 'test message',
          guards: activeGuards,
          initGuardIndex: 0,
        },
        'peerId-2',
        6,
        'random signature'
      );
      expect(mockedStartSign).toHaveBeenCalledTimes(1);
      expect(mockedStartSign).toHaveBeenCalledWith(
        'test message',
        activeGuards
      );
      expect(mockSubmit).toHaveBeenCalledTimes(1);
      expect(mockSubmit).toHaveBeenCalledWith(
        expect.any(String),
        activeGuards.slice(1).map((item) => item.peerId)
      );
      const msg = JSON.parse(mockSubmit.mock.calls[0][0]);
      expect(msg.type).toEqual(startMessage);
      expect(msg.index).toEqual(0);
      expect(msg.timestamp).toEqual(timestamp);
      expect(msg.payload).toEqual({
        msg: 'test message',
        guards: activeGuards,
        signs: [
          ...Array(6)
            .fill('')
            .map((item, index) => `random signature ${index}`),
          'random signature',
          '',
          '',
          '',
        ],
      });
    });

    /**
     * @target GuardDetection.handleApproveMessage should do nothing when sign is invalid
     * @dependencies
     * @scenario
     * - add sign instance to list with valid request
     * - call handleApproveMessage with invalid message
     * @expected
     * - mockedStartSign must not call
     * - mockSubmit must not call
     */
    it('should do nothing when sign is invalid', async () => {
      const mockedStartSign = jest
        .spyOn(signer, 'startSign')
        .mockResolvedValue();
      await signer.mockedHandleApproveMessage(
        {
          msg: 'test message invalid',
          guards: activeGuards,
          initGuardIndex: 0,
        },
        'peerId-2',
        2,
        'random signature'
      );
      expect(mockedStartSign).toHaveBeenCalledTimes(0);
      expect(mockSubmit).toHaveBeenCalledTimes(0);
    });

    /**
     * @target GuardDetection.handleApproveMessage should do nothing when sign have no request
     * @dependencies
     * @scenario
     * - add sign instance to list without request
     * - call handleApproveMessage
     * @expected
     * - mockedStartSign must not call
     * - mockSubmit must not call
     */
    it('should do nothing when sign have no request', async () => {
      const mockedStartSign = jest
        .spyOn(signer, 'startSign')
        .mockResolvedValue();
      const sign = signer.getSigns()[0];
      sign.request = undefined;
      await signer.mockedHandleApproveMessage(
        {
          msg: 'test message',
          guards: activeGuards,
          initGuardIndex: 0,
        },
        'peerId-2',
        2,
        'random signature'
      );
      expect(mockedStartSign).toHaveBeenCalledTimes(0);
      expect(mockSubmit).toHaveBeenCalledTimes(0);
    });

    /**
     * @target GuardDetection.handleApproveMessage should do nothing in noWork time
     * @dependencies
     * @scenario
     * - add sign instance to list
     * - mock isNoWorkTime to return true
     * - call handleApproveMessage
     * @expected
     * - mockedStartSign must not call
     * - mockSubmit must not call
     */
    it('should do nothing in noWork time', async () => {
      const mockedStartSign = jest
        .spyOn(signer, 'startSign')
        .mockResolvedValue();
      jest.spyOn(signer as any, 'isNoWorkTime').mockReturnValue(true);
      await signer.mockedHandleApproveMessage(
        {
          msg: 'test message',
          guards: activeGuards,
          initGuardIndex: 0,
        },
        'peerId-2',
        2,
        'random signature'
      );
      expect(mockedStartSign).toHaveBeenCalledTimes(0);
      expect(mockSubmit).toHaveBeenCalledTimes(0);
    });
  });

  describe('handleStartMessage', () => {
    let activeGuards: Array<ActiveGuard>;
    let mockedStartSign: jest.SpyInstance;
    beforeEach(async () => {
      signer.getSigns().push({
        msg: 'signing message',
        signs: [],
        addedTime: timestamp,
        callback: jest.fn(),
        posted: false,
      });
      activeGuards = await Promise.all(
        guardSigners.map(async (item, index) => ({
          peerId: `peerId-${index}`,
          publicKey: await item.getPk(),
        }))
      );
      mockedStartSign = jest.spyOn(signer, 'startSign').mockResolvedValue();
    });

    /**
     * @target GuardDetection.handleStartMessage should call start sign when all conditions are met
     * @dependencies
     * @scenario
     * - add sign instance to list
     * - mock startSign
     * - call handleStartMessage
     * @expected
     * - mockedStartSign must call once with `signing message` and activeGuards
     */
    it('should call start sign when all conditions are met', async () => {
      jest
        .spyOn(signer as any, 'getApprovedGuards')
        .mockResolvedValue(activeGuards);
      await signer.mockedHandleStartMessage(
        {
          msg: 'signing message',
          guards: activeGuards,
          signs: Array(10)
            .fill('')
            .map((item, index) => (index < 7 ? `signature ${index}` : '')),
        },
        timestamp,
        6,
        'peerId-6'
      );
      expect(mockedStartSign).toHaveBeenCalledTimes(1);
      expect(mockedStartSign).toHaveBeenCalledWith(
        'signing message',
        activeGuards
      );
    });

    /**
     * @target GuardDetection.handleStartMessage should not call start sign when not required guard available
     * @dependencies
     * @scenario
     * - add sign instance to list
     * - mock startSign
     * - mock getApprovedGuards to return list of 6 guards
     * - call handleStartMessage
     * @expected
     * - mockedStartSign must not call
     */
    it('should not call start sign when not required guard available', async () => {
      jest
        .spyOn(signer as any, 'getApprovedGuards')
        .mockResolvedValue(activeGuards.slice(0, 6));
      await signer.mockedHandleStartMessage(
        {
          msg: 'signing message',
          guards: activeGuards,
          signs: Array(10)
            .fill('')
            .map((item, index) => (index < 7 ? `signature ${index}` : '')),
        },
        timestamp,
        6,
        'peerId-6'
      );
      expect(mockedStartSign).toHaveBeenCalledTimes(0);
    });

    /**
     * @target GuardDetection.handleStartMessage should not call start sign when not guard turn
     * @dependencies
     * @scenario
     * - add sign instance to list
     * - mock startSign
     * - mock verify method of EdDSA signer to return false once
     * - call handleStartMessage with guard index 5
     * @expected
     * - mockedStartSign must not call
     */
    it('should not call start sign when not guard turn', async () => {
      await signer.mockedHandleStartMessage(
        {
          msg: 'signing message',
          guards: activeGuards,
          signs: Array(10)
            .fill('')
            .map((item, index) => (index < 7 ? `signature ${index}` : '')),
        },
        timestamp,
        5,
        'peerId-5'
      );
      expect(mockedStartSign).toHaveBeenCalledTimes(0);
    });

    /**
     * @target GuardDetection.handleStartMessage should not call start sign when selected guard not involved
     * @dependencies
     * @scenario
     * - add sign instance to list
     * - mock startSign
     * - remove guard index 0 from active guards
     * - call handleStartMessage
     * @expected
     * - mockedStartSign must not call
     */
    it('should not call start sign when selected guard not involved', async () => {
      await signer.mockedHandleStartMessage(
        {
          msg: 'signing message',
          guards: [...activeGuards.slice(1)],
          signs: Array(10)
            .fill('')
            .map((item, index) => (index < 7 ? `signature ${index}` : '')),
        },
        timestamp,
        6,
        'peerId-6'
      );
      expect(mockedStartSign).toHaveBeenCalledTimes(0);
    });

    /**
     * @target GuardDetection.handleStartMessage should not call start sign when message is invalid
     * @dependencies
     * @scenario
     * - add sign instance to list
     * - mock startSign
     * - call handleStartMessage with invalid message to sign
     * @expected
     * - mockedStartSign must not call
     */
    it('should not call start sign when message is invalid', async () => {
      await signer.mockedHandleStartMessage(
        {
          msg: 'signing message invalid',
          guards: activeGuards,
          signs: Array(10)
            .fill('')
            .map((item, index) => (index < 7 ? `signature ${index}` : '')),
        },
        timestamp,
        6,
        'peerId-5'
      );
      expect(mockedStartSign).toHaveBeenCalledTimes(0);
    });
  });

  describe('handleSignData', () => {
    const callback = jest.fn();
    beforeEach(() => {
      const signs = signer.getSigns();
      signs.push({
        msg: 'valid signing data',
        callback: callback,
        signs: [],
        addedTime: 0,
        posted: true,
      });
    });

    /**
     * @target GuardDetection.handleSignData should throw error when sign does not exist
     * @dependencies
     * @scenario
     * - add sign instance to list
     * - call handleSignData with invalid message to sign
     * @expected
     * - throw exception
     */
    it('should throw error when sign does not exist', () => {
      expect(() =>
        signer.handleSignData(
          StatusEnum.Success,
          'invalid signing data',
          'signature'
        )
      ).toThrow();
    });

    /**
     * @target GuardDetection.handleSignData should throw error when status is success and no signature passed
     * @dependencies
     * @scenario
     * - add sign instance to list
     * - call handleSignData with valid message without signature
     * @expected
     * - throw exception
     */
    it('should throw error when status is success and no signature passed', () => {
      expect(() =>
        signer.handleSignData(StatusEnum.Success, 'valid signing data')
      ).toThrow();
    });

    /**
     * @target GuardDetection.handleSignData should call callback function with success status and signature
     * @dependencies
     * @scenario
     * - add sign instance to list
     * - call handleSignData
     * @expected
     * - callback function called once
     * - callback function called with true and undefined as message and signature
     */
    it('should call callback function with success status and signature', () => {
      signer.handleSignData(
        StatusEnum.Success,
        'valid signing data',
        'signature'
      );
      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith(true, undefined, 'signature');
    });

    /**
     * @target GuardDetection.handleSignData should call callback function with fail status and message
     * @dependencies
     * @scenario
     * - add sign instance to list
     * - call handleSignData with Failed status and error message
     * @expected
     * - callback function called once
     * - callback function called with false and error message
     */
    it('should call callback function with fail status and message', () => {
      signer.handleSignData(
        StatusEnum.Failed,
        'valid signing data',
        '',
        'error message'
      );
      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith(false, 'error message');
    });

    /**
     * @target GuardDetection.handleSignData should remove sign element from signing queue
     * @dependencies
     * @scenario
     * - add sign instance to list
     * - call handleSignData
     * @expected
     * - signing list must be empty
     */
    it('should remove sign element from signing queue', async () => {
      await signer.handleSignData(
        StatusEnum.Success,
        'valid signing data',
        'signature'
      );
      const signs = signer.getSigns();
      expect(signs.length).toEqual(0);
    });
  });

  describe('getApprovedGuards', () => {
    /**
     * @target TssSigner.getApprovedGuards should not return selected guard when signature is empty string
     * @dependencies
     * @scenario
     * - call function with one guard and list of empty string as signatures
     * @expected
     * - returned list must be empty
     */
    it('should not return selected guard when signature is empty string', async () => {
      const res = await signer.mockedGetApprovedGuards(
        timestamp,
        {
          guards: [
            {
              publicKey: await guardSigners[1].getPk(),
              peerId: 'peer-Id1',
            },
          ],
          msg: 'testing message',
          initGuardIndex: 1,
        },
        Array(10).fill('')
      );
      expect(res.length).toEqual(0);
    });

    /**
     * @target TssSigner.getApprovedGuards should not return selected guard when pk not in guardsPk
     * @dependencies
     * @scenario
     * - call function with one new guard and list of random strings as signatures
     * @expected
     * - returned list must be empty
     */
    it('should not return selected guard when pk not in guardsPk', async () => {
      const res = await signer.mockedGetApprovedGuards(
        timestamp,
        {
          guards: [
            {
              publicKey: await new EdDSA(await EdDSA.randomKey()).getPk(),
              peerId: 'peer-Id1',
            },
          ],
          msg: 'testing message',
          initGuardIndex: 1,
        },
        Array(10).fill('random-signature')
      );
      expect(res.length).toEqual(0);
    });

    /**
     * @target TssSigner.getApprovedGuards should not return selected guard when signature is invalid
     * @dependencies
     * @scenario
     * - mock verify sign to return false
     * - call function with one guard and list of random strings as signatures
     * @expected
     * - returned list must be empty
     */
    it('should not return selected guard when signature is invalid', async () => {
      jest.spyOn(guardSigners[0], 'verify').mockResolvedValue(false);
      const res = await signer.mockedGetApprovedGuards(
        timestamp,
        {
          guards: [
            {
              publicKey: await guardSigners[0].getPk(),
              peerId: 'peer-Id1',
            },
          ],
          msg: 'testing message',
          initGuardIndex: 1,
        },
        Array(10).fill('random-signature')
      );
      expect(res.length).toEqual(0);
    });

    /**
     * @target TssSigner.getApprovedGuards should return selected guard when signature is valid
     * @dependencies
     * @scenario
     * - mock verify sign to return true
     * - call function with one guard and list of random strings as signatures
     * @expected
     * - returned list must contain entered guard
     */
    it('should return selected guard when signature is valid', async () => {
      jest.spyOn(guardSigners[0], 'verify').mockResolvedValue(true);
      const guards = [
        {
          publicKey: await guardSigners[0].getPk(),
          peerId: 'peer-Id1',
        },
      ];
      const res = await signer.mockedGetApprovedGuards(
        timestamp,
        {
          guards,
          msg: 'testing message',
          initGuardIndex: 1,
        },
        Array(10).fill('random-signature')
      );
      expect(res.length).toEqual(1);
      expect(res).toEqual(guards);
    });
  });
});
