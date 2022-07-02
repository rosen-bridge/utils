import { TokensMap } from "./types";
import tokensList from "../tokensList/tokensList.json"

/**
 * TokenMap class searches for different assets properties in different chains
 */
export class TokenMap{
    private tokensConfig: TokensMap

    /**
     * it takes input tokens list json and the default value is used for
     *  production
     * @param tokens tokens list as json
     */
    constructor(tokens: TokensMap = tokensList) {
        this.tokensConfig = tokens;
    }

    /**
     * it returns specific token with respect to condition on the specific chain
     * @param chain
     *  example: "ergo"
     * @param condition
     *  example: {tokenID:"tokenID"}
     */
    search = (
        chain: string,
        condition: { [key: string]: string },
    ) => {
        return this.tokensConfig.tokens.filter((token) => {
            if (Object.hasOwnProperty.call(token, chain)) {
                const resToken = token[chain];
                for (const [key, val] of Object.entries(condition)) {
                    if (!Object.hasOwnProperty.call(resToken, key) || resToken[key] !== val) {
                        return false;
                    }
                }
                return true;
            } else {
                return false;
            }
        });
    }

}
