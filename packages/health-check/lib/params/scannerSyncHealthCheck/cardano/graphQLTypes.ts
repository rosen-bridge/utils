import { gql } from '@apollo/client/core';

export type CurrentHeightQuery = {
  __typename?: 'Query';
  cardano: {
    __typename?: 'Cardano';
    tip: { __typename?: 'Block'; number?: number | null };
  };
};

export const currentHeightQuery = gql(`
query currentHeight {
  cardano {
    tip {
      number
    }
  }
}
`);
