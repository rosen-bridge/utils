import { RosenTokens } from '@rosen-bridge/tokens';
import {
  CARDANO_CHAIN,
  CARDANO_NATIVE_TOKEN,
  ERGO_CHAIN,
  ERGO_NATIVE_TOKEN,
} from '../../lib/getRosenData/const';

export default class TestUtils {
  static tokens: RosenTokens = {
    idKeys: {
      ergo: 'tokenId',
      cardano: 'fingerprint',
    },
    tokens: [
      {
        [ERGO_CHAIN]: {
          tokenId: ERGO_NATIVE_TOKEN,
          metaData: {
            type: 'tokenType',
            residency: 'tokenResidency',
          },
        },
        [CARDANO_CHAIN]: {
          fingerprint:
            'ace7bcc2ce705679149746620de3a84660ce57573df54b5a096e39a2',
          policyId: 'ace7bcc2ce705679149746620de3a84660ce57573df54b5a096e39a2',
          assetName: '7369676d61',
          metaData: {
            type: 'tokenType',
            residency: 'tokenResidency',
          },
        },
      },
      {
        [ERGO_CHAIN]: {
          tokenId:
            'f6a69529b12a7e2326acffee8383e0c44408f87a872886fadf410fe8498006d3',
          metaData: {
            type: 'tokenType',
            residency: 'tokenResidency',
          },
        },
        [CARDANO_CHAIN]: {
          fingerprint: CARDANO_NATIVE_TOKEN,
          tokenId: CARDANO_NATIVE_TOKEN,
          id: CARDANO_NATIVE_TOKEN,
          metaData: {
            type: 'tokenType',
            residency: 'tokenResidency',
          },
        },
      },
    ],
  };

  static noNativeTokens: RosenTokens = {
    idKeys: {
      ergo: 'tokenId',
      cardano: 'fingerprint',
    },
    tokens: [
      {
        [ERGO_CHAIN]: {
          tokenId:
            'f6a69529b12a7e2326acffee8383e0c44408f87a872886fadf410fe8498006d3',
          metaData: {
            type: 'tokenType',
            residency: 'tokenResidency',
          },
        },
        [CARDANO_CHAIN]: {
          fingerprint:
            'ace7bcc2ce705679149746620de3a84660ce57573df54b5a096e39a2',
          policyId: 'ace7bcc2ce705679149746620de3a84660ce57573df54b5a096e39a2',
          assetName: '7369676d61',
          metaData: {
            type: 'tokenType',
            residency: 'tokenResidency',
          },
        },
      },
    ],
  };
}
