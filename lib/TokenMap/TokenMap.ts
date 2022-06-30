import { TokensMap } from "./types";
import tokensList from "../tokensList/tokensList.json"

/**
 * TokenMap class searches for different assets properties in different chains
 */
export class TokenMap{
    private tokensConfig: TokensMap

    constructor(tokens: TokensMap = tokensList) {
        this.tokensConfig = tokens;
    }

    /**
     * it searches tokens for data specified in `filter` and returns data specified
     *  in `result` function input
     * @param filter
     *  example: {chain: "ergo", condition: {tokenID:"tokenID"}}
     * @param result
     *  example: {chain: "cardano", value:["fingerprint"]}
     */
    search = (
        filter: { chain: string, condition: { [key: string]: string } },
        result: { chain: string, value: Array<string> }
    ) => {
        return this.tokensConfig.tokens.filter((token) => {
            if (Object.hasOwnProperty.call(token, filter.chain)) {
                const chain = token[filter.chain];
                for (const [key, val] of Object.entries(filter.condition)) {
                    if (Object.hasOwnProperty.call(chain, key)) {
                        if (chain[key] !== val) {
                            return false;
                        }
                    } else {
                        return false;
                    }
                }
            } else {
                return false;
            }
            return true;
        }).map((token) => {
            if (Object.hasOwnProperty.call(token, result.chain)) {
                const chain = token[result.chain];
                for (const key of Object.keys(chain)) {
                    if (!result.value.includes(key)) {
                        delete chain[key]
                    }
                }
                return chain;
            }
            return {}
        });
    }

}
