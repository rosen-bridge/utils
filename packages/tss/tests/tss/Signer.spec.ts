import { EdDSA, GuardDetection } from '../../lib';
import { TestSigner } from './TestSigner';
import { generateSigners } from '../utils';
import {
  requestMessage,
  approveMessage,
  startMessage,
} from '../../lib/const/signer';

describe('Signer', () => {
  let signer: TestSigner;
  let mockSubmit = jest.fn();
  let guardSigners: Array<EdDSA>;

  beforeEach(async () => {
    const signers = await generateSigners();
    guardSigners = signers.guardSigners;
    jest.resetAllMocks();
    mockSubmit = jest.fn();
    const detection = new GuardDetection({
      signer: guardSigners[0],
      guardsPublicKey: signers.guardPks,
      submit: mockSubmit,
      needGuardThreshold: 7,
      getPeerId: () => Promise.resolve('myPeerId'),
    });
    signer = new TestSigner({
      submitMsg: mockSubmit,
      signer: guardSigners[0],
      detection: detection,
      threshold: 7,
      guardsPk: signers.guardPks,
      tssSignUrl: '',
      getPeerId: () => Promise.resolve('myPeerId'),
    });
  });

  describe('update', () => {
    /* empty function */
  });

  describe('getGuardTurn', () => {
    /**
     * @target Signer.getGuardTurn should return guard index turn
     * @dependency
     * @scenario
     * - mock Date.now to return 1686286005068 ( a random timestamp )
     * @expected
     * - must return 6
     */
    it('should return guard index turn', () => {
      const currentTime = 1686286005068;
      jest.spyOn(Date, 'now').mockReturnValue(currentTime);
      expect(signer.getGuardTurn()).toEqual(6);
    });
  });

  describe('sign', () => {
    /* empty function */
  });

  describe('signPromised', () => {
    /* empty function */
  });

  describe('processMessage', () => {
    /**
     * @target Signer.processMessage should call handleRequestMessage
     * when message type is requestMessage
     * @dependency
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
     * @target Signer.processMessage should call handleApproveMessage
     * when message type is approveMessage
     * @dependency
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
     * @dependency
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
    /* empty function */
  });

  describe('getInvalidGuards', () => {
    /* empty function */
  });

  describe('handleRequestMessage', () => {
    /* empty function */
  });

  describe('getSigned', () => {
    /* empty function */
  });

  describe('handleApproveMessage', () => {
    /* empty function */
  });

  describe('handleStartMessage', () => {
    /* empty function */
  });

  describe('startSign', () => {
    /* empty function */
  });
});
