// import { install } from "react-native-quick-crypto";
import { shim, btoa, atob } from "react-native-quick-base64";
// import { decode, encode } from "base-64";

// if (!global.btoa) {
//   global.btoa = encode;
// }

// if (!global.atob) {
//   global.atob = decode;
// }

if (!global.btoa) {
  global.btoa = btoa;
}

if (!global.atob) {
  global.atob = atob;
}

// shim();
// install();

// Avoid using node dependent modules
process.browser = true;
