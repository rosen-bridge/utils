// import firstSample from './samples/firstSample.json'
// import { Chain, TokensMap } from "../lib/TokenMap/types";
// import { TokenMap } from "../lib/TokenMap/TokenMap";
// import { expect } from "chai";
//
// describe("TokenMap", () => {
//     describe("searchChain", () => {
//         it("checks for wrong search key", () => {
//             const map: TokensMap = firstSample;
//             const tokenMap = new TokenMap(map);
//             for (let i = 0; i < 3; i++) {
//                 const res = tokenMap.searchChain(map.tokens[i], Chain.ERGO, "wrongKey");
//                 expect(res.result).to.be.false;
//             }
//         })
//
//         it("checks for tokenId in ergo", () => {
//             const map: TokensMap = firstSample;
//             const tokenMap = new TokenMap(map);
//             for (let i = 0; i < 3; i++) {
//                 const res = tokenMap.searchChain(map.tokens[i], Chain.ERGO, "tokenID");
//                 expect(res.result).to.be.true;
//                 expect(res.searchResult).to.be.eql(map.tokens[i].ergo.tokenID);
//             }
//         })
//
//         it("checks for tokenName in ergo", () => {
//             const map: TokensMap = firstSample;
//             const tokenMap = new TokenMap(map);
//             for (let i = 0; i < 3; i++) {
//                 const res = tokenMap.searchChain(map.tokens[i], Chain.ERGO, "tokenName");
//                 expect(res.result).to.be.true;
//                 expect(res.searchResult).to.be.eql(map.tokens[i].ergo.tokenName);
//             }
//         })
//
//         it("checks for fingerprint in cardano", () => {
//             const map: TokensMap = firstSample;
//             const tokenMap = new TokenMap(map);
//             for (let i = 0; i < 3; i++) {
//                 const res = tokenMap.searchChain(map.tokens[i], Chain.CARDANO, "fingerprint");
//                 expect(res.result).to.be.true;
//                 expect(res.searchResult).to.be.eql(map.tokens[i].cardano.fingerprint);
//             }
//         })
//
//         it("checks for policyID in cardano", () => {
//             const map: TokensMap = firstSample;
//             const tokenMap = new TokenMap(map);
//             for (let i = 0; i < 3; i++) {
//                 const res = tokenMap.searchChain(map.tokens[i], Chain.CARDANO, "policyID");
//                 expect(res.result).to.be.true;
//                 expect(res.searchResult).to.be.eql(map.tokens[i].cardano.policyID);
//             }
//         })
//
//         it("checks for assetID in cardano", () => {
//             const map: TokensMap = firstSample;
//             const tokenMap = new TokenMap(map);
//             for (let i = 0; i < 3; i++) {
//                 const res = tokenMap.searchChain(map.tokens[i], Chain.CARDANO, "assetID");
//                 expect(res.result).to.be.true;
//                 expect(res.searchResult).to.be.eql(map.tokens[i].cardano.assetID);
//             }
//         })
//     })
//
//     describe("search", () => {
//         it("checks assetID in ergo should mapped to correct fingerprint in cardano", () => {
//             const map: TokensMap = firstSample;
//             const tokenMap = new TokenMap(map);
//             const res = tokenMap.search(
//                 {
//                     chain: Chain.ERGO,
//                     search: {
//                         key: "tokenID",
//                         value: "1111111111111111111111111111111111111111111111111111111111111111"
//                     }
//                 },
//                 {chain: Chain.CARDANO, value: "fingerprint"}
//             );
//             expect(res.result).to.be.true;
//             expect(res.searchResult).to.be.eql(map.tokens[0].cardano.fingerprint)
//         })
//
//         it("checks assetID in ergo should mapped to correct token name in ergo", () => {
//             const map: TokensMap = firstSample;
//             const tokenMap = new TokenMap(map);
//             const res = tokenMap.search(
//                 {
//                     chain: Chain.ERGO,
//                     search: {
//                         key: "tokenID",
//                         value: "1111111111111111111111111111111111111111111111111111111111111111"
//                     }
//                 },
//                 {chain: Chain.ERGO, value: "tokenName"}
//             );
//             expect(res.result).to.be.true;
//             expect(res.searchResult).to.be.eql(map.tokens[0].ergo.tokenName)
//         })
//
//         it("checks policyID in cardano should mapped to first correct tokenID in ergo", () => {
//             const map: TokensMap = firstSample;
//             const tokenMap = new TokenMap(map);
//             const res = tokenMap.search(
//                 {
//                     chain: Chain.CARDANO,
//                     search: {
//                         key: "policyID",
//                         value: "policyID3"
//                     }
//                 },
//                 {chain: Chain.ERGO, value: "tokenID"}
//             );
//             expect(res.result).to.be.true;
//             expect(res.searchResult).to.be.eql(map.tokens[2].ergo.tokenID)
//         })
//     })
// })