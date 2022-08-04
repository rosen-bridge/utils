import firstSample from './samples/firstSample.json'
import { RosenTokens } from "../lib/TokenMap/types";
import { TokenMap } from "../lib";
import { expect } from "chai";

const firstToken = {
    "ergo": {
        "tokenID": "1111111111111111111111111111111111111111111111111111111111111111",
        "tokenName": "test token1"
    },
    "cardano": {
        "fingerprint": "asset111111111111111111111111111111111111111",
        "policyID": "22222222222222222222222222222222222222222222222222222222",
        "assetID": "3333333333333333333333333333333333333333333333333333333333333333333333333333"
    }
}

const secondToken = {
    "ergo": {
        "tokenID": "tokenId",
        "tokenName": "test token3"
    },
    "cardano": {
        "fingerprint": "asset3fingerprint",
        "policyID": "policyID3",
        "assetID": "assetID3"
    }
}

describe("TokenMap", () => {
    describe("search", () => {
        it("should return asset with condition on the policyID and assetID", () => {
            const map: RosenTokens = firstSample;
            const tokenMap = new TokenMap(map);
            const res = tokenMap.search(
                "cardano",
                {
                    policyID: "22222222222222222222222222222222222222222222222222222222",
                    assetID: "3333333333333333333333333333333333333333333333333333333333333333333333333333"
                }
            )
            expect(res.length).to.be.eql(1);
            expect(res[0]).to.be.eql(firstToken)
        });

        it("returns asset with specific ergo tokenID", () => {
            const map: RosenTokens = firstSample;
            const tokenMap = new TokenMap(map);
            const res = tokenMap.search(
                "ergo",
                {
                    tokenID: "tokenId",
                })
            expect(res.length).to.be.eql(1);
            expect(res[0]).to.be.eql(secondToken)
        });

        it("should return empty array in case of wrong chain", () => {
            const map: RosenTokens = firstSample;
            const tokenMap = new TokenMap(map);
            const res = tokenMap.search(
                "bitcoin",
                {
                    tokenID: "tokenId",
                })
            expect(res.length).to.be.eql(0);
        });

    })
    describe("getID", () => {
        it("should return ergo tokenId of tha passed token", () => {
            const map: RosenTokens = firstSample;
            const tokenMap = new TokenMap(map);
            const res = tokenMap.getID(firstToken, 'ergo');
            expect(res).to.be.equal(firstToken.ergo.tokenID);
        })

        it("should return cardano fingerprint of tha passed token", () => {
            const map: RosenTokens = firstSample;
            const tokenMap = new TokenMap(map);
            const res = tokenMap.getID(secondToken, 'cardano');
            expect(res).to.be.equal(secondToken.cardano.fingerprint);
        })

    })
})
