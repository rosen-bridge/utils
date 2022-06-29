import { TokenMap } from "./TokenMap/TokenMap";
import tokens from "./tokens.json"
export {TokenMap} from "./TokenMap/TokenMap";
export {Chain} from "./TokenMap/types";

const test=new TokenMap(tokens);
console.log(test.searchS({chain:"ergo",condition:{tokenID:"1111111111111111111111111111111111111111111111111111111111111111"}},{chain:"cardano",value:["fingerprint"]}))
