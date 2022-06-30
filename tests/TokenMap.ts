import firstSample from './samples/firstSample.json'
import { TokensMap } from "../lib/TokenMap/types";
import { TokenMap } from "../lib";
import { expect } from "chai";

describe("TokenMap", () => {
    describe("search", () => {
        it("checks should return assets finger print in cardano", () => {
            const map: TokensMap = firstSample;
            const tokenMap = new TokenMap(map);
            const res = tokenMap.search(
                {
                    chain: "cardano",
                    condition: {
                        policyID: "22222222222222222222222222222222222222222222222222222222",
                        assetID: "3333333333333333333333333333333333333333333333333333333333333333333333333333"
                    }
                }, {
                    chain: "cardano",
                    value: ["fingerprint"]
                })
            expect(res.length).to.be.eql(1);
            expect(res[0]).to.be.eql({fingerprint: "asset111111111111111111111111111111111111111"})
        });

        it("returns asset fingerprint in cardano with ergo tokenID", () => {
            const map: TokensMap = firstSample;
            const tokenMap = new TokenMap(map);
            const res = tokenMap.search(
                {
                    chain: "ergo",
                    condition: {
                        tokenID: "tokenId",
                    }
                }, {
                    chain: "cardano",
                    value: ["fingerprint"]
                })
            expect(res.length).to.be.eql(1);
            expect(res[0]).to.be.eql({fingerprint: "asset3fingerprint"})
        });

        it("returns ergo tokenID with cardano asset fingerPrint", () => {
            const map: TokensMap = firstSample;
            const tokenMap = new TokenMap(map);
            const res = tokenMap.search(
                {
                    chain: "cardano",
                    condition: {
                        fingerprint: "asset122222222222222222222222222222222222222",
                    }
                }, {
                    chain: "ergo",
                    value: ["tokenID"]
                })
            expect(res.length).to.be.eql(1);
            expect(res[0]).to.be.eql({tokenID: "2222222222222222222222222222222222222222222222222222222222222222"})
        });

    })

})
