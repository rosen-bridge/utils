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
      cardano: 'tokenId',
    },
    tokens: [
      {
        [ERGO_CHAIN]: {
          tokenId: ERGO_NATIVE_TOKEN,
          name: ERGO_NATIVE_TOKEN,
          decimals: 9,
          metaData: {
            type: 'tokenType',
            residency: 'tokenResidency',
          },
        },
        [CARDANO_CHAIN]: {
          tokenId:
            'ace7bcc2ce705679149746620de3a84660ce57573df54b5a096e39a2.7369676d61',
          policyId: 'ace7bcc2ce705679149746620de3a84660ce57573df54b5a096e39a2',
          assetName: '7369676d61',
          name: 'Wrapped Erg',
          decimals: 9,
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
          name: 'wrapped ada',
          decimals: 6,
          metaData: {
            type: 'tokenType',
            residency: 'tokenResidency',
          },
        },
        [CARDANO_CHAIN]: {
          tokenId: CARDANO_NATIVE_TOKEN,
          policyId: '',
          assetName: '414441',
          name: 'ada',
          decimals: 6,
          metaData: {
            type: 'tokenType',
            residency: 'tokenResidency',
          },
        },
      },
      {
        [ERGO_CHAIN]: {
          tokenId:
            'b37bfa41c2d9e61b4e478ddfc459a03d25b658a2305ffb428fbc47ad6abbeeaa',
          name: 'RstHoskyVTest2',
          decimals: 0,
          metaData: {
            type: 'EIP-004',
            residency: 'wrapped',
          },
        },
        [CARDANO_CHAIN]: {
          tokenId:
            'a0028f350aaabe0545fdcb56b039bfb08e4bb4d8c4d7c3c7d481c235.484f534b59',
          policyId: 'a0028f350aaabe0545fdcb56b039bfb08e4bb4d8c4d7c3c7d481c235',
          assetName: '484f534b59',
          name: 'WrappedHosky',
          decimals: 0,
          metaData: {
            type: 'CIP26',
            residency: 'native',
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
          name: 'Wrapped token',
          decimals: 0,
          metaData: {
            type: 'tokenType',
            residency: 'tokenResidency',
          },
        },
        [CARDANO_CHAIN]: {
          tokenId:
            'ace7bcc2ce705679149746620de3a84660ce57573df54b5a096e39a2.7369676d61',
          policyId: 'ace7bcc2ce705679149746620de3a84660ce57573df54b5a096e39a2',
          assetName: '7369676d61',
          name: 'Cardano token',
          decimals: 0,
          metaData: {
            type: 'tokenType',
            residency: 'tokenResidency',
          },
        },
      },
    ],
  };
}
