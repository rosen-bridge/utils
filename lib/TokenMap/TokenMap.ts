import { TokensMap } from "./types";
import * as _ from "lodash";

export class TokenMap{
    private tokensConfig: TokensMap

    constructor(tokens: TokensMap) {
        this.tokensConfig = tokens;
    }

    search = (
        filter: { chain: string, condition: { [key: string]: string } },
        result: { chain: string, value: Array<string> }
    ) => {
        const res = this.tokensConfig.tokens.filter((token) => {
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
        })

        if (res.length > 0) {
            if (Object.hasOwnProperty.call(res[0], result.chain)) {
                const chain = res[0][result.chain];
                for (const key of Object.keys(chain)) {
                    if (!result.value.includes(key)) {
                        delete chain[key]
                    }
                }
                return chain;
            }
        }
        return {}
    }

}
