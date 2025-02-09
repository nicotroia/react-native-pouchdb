import "react-native-get-random-values";
import { btoa, atob } from "react-native-quick-base64";

if (!global.btoa) {
  global.btoa = btoa;
}

if (!global.atob) {
  global.atob = atob;
}

// Avoid using node dependent modules
process.browser = true;
