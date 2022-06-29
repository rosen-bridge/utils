export type ErgoToken = {
    tokenID: string,
    tokenName: string,
};

export type CardanoToken = {
    fingerprint: string,
    policyID: string,
    assetID: string,
}

export type Token = {
    ergo: ErgoToken,
    cardano: CardanoToken,
}

export type TokensMap = {
    tokens: Array<Token>
};

export enum Chain{
    ERGO = 0,
    CARDANO = 1,
}
