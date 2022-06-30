import firstSample from './samples/firstSample.json'
import { TokensMap } from "../lib/TokenMap/types";
import { TokenMap } from "../lib";
import { expect } from "chai";

describe("TokenMap", () => {
    describe("search", () => {
        it("should return asset with condition on the policyID and assetID", () => {
            const map: TokensMap = firstSample;
            const tokenMap = new TokenMap(map);
            const res = tokenMap.search(
                "cardano",
                {
                    policyID: "22222222222222222222222222222222222222222222222222222222",
                    assetID: "3333333333333333333333333333333333333333333333333333333333333333333333333333"
                }
            )
            expect(res.length).to.be.eql(1);
            expect(res[0]).to.be.eql({
                "ergo": {
                    "tokenID": "1111111111111111111111111111111111111111111111111111111111111111",
                    "tokenName": "test token1"
                },
                "cardano": {
                    "fingerprint": "asset111111111111111111111111111111111111111",
                    "policyID": "22222222222222222222222222222222222222222222222222222222",
                    "assetID": "3333333333333333333333333333333333333333333333333333333333333333333333333333"
                }
            })
        });

        it("returns asset with specific ergo tokenID", () => {
            const map: TokensMap = firstSample;
            const tokenMap = new TokenMap(map);
            const res = tokenMap.search(
                "ergo",
                {
                    tokenID: "tokenId",
                })
            expect(res.length).to.be.eql(1);
            expect(res[0]).to.be.eql({
                "ergo": {
                    "tokenID": "tokenId",
                    "tokenName": "test token3"
                },
                "cardano": {
                    "fingerprint": "asset3fingerprint",
                    "policyID": "policyID3",
                    "assetID": "assetID3"
                }
            })
        });

    })

})
