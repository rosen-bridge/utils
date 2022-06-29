import { Chain, Token, TokensMap } from "./types";

export class TokenMap{
    private tokensConfig: TokensMap

    constructor(tokens: TokensMap) {
        this.tokensConfig = tokens;
    }

    /**
     * search in a specific token and specific chain for specific search key
     * @param token
     * @param chain
     * @param searchKey
     */
    searchChain = (token: Token, chain: number, searchKey: string) => {
        let searchResult = "";
        switch (chain) {
            case Chain.ERGO: {
                const resultChain = token.ergo;
                switch (searchKey) {
                    case("tokenID"): {
                        searchResult = resultChain.tokenID;
                        break;
                    }
                    case("tokenName"): {
                        searchResult = resultChain.tokenName;
                        break;
                    }
                }
                break;
            }

            case Chain.CARDANO: {
                const resultChain = token.cardano;
                switch (searchKey) {
                    case("fingerprint"): {
                        searchResult = resultChain.fingerprint;
                        break;
                    }
                    case("policyID"): {
                        searchResult = resultChain.policyID;
                        break;
                    }
                    case("assetID"): {
                        searchResult = resultChain.assetID;
                        break;
                    }
                }
            }
        }
        return (searchResult === "" ? {searchResult: searchResult, result: false} : {
            searchResult: searchResult,
            result: true
        });
    }

    /**
     * search the map for specific token key with its value and returns specific token key in corresponding chain
     * @param searchOn
     * @param searchFor
     */
    search = (
        searchOn: {
            chain: number,
            search: {
                key: string,
                value: string
            }
        },
        searchFor: {
            chain: number,
            value: string
        }
    ) => {
        for (const token of this.tokensConfig.tokens) {
            const searchResult = this.searchChain(token, searchOn.chain, searchOn.search.key);
            if (searchResult.result && searchResult.searchResult === searchOn.search.value) {
                return this.searchChain(token, searchFor.chain, searchFor.value);
            }
        }
        return {searchResult: "", result: false}
    }

}
