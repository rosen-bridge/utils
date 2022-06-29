export type TokensMap = {
    tokens: Array<{ [key: string]: { [key: string]: string } }>
};

export enum Chain{
    ERGO = 0,
    CARDANO = 1,
}
