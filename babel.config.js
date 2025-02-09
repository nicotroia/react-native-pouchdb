module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      "babel-preset-expo",
      // "@babel/preset-typescript",
      //   "@babel/preset-env",
      //   "@babel/preset-react",
    ],
    plugins: [
      [
        "module-resolver",
        {
          extensions: [".tsx", ".ts", ".js", ".json"],
          alias: {
            // crypto: "react-native-quick-crypto",
            // stream: "readable-stream",
            // buffer: "@craftzdog/react-native-buffer",
            // "pouchdb-collate": "@craftzdog/pouchdb-collate-react-native",
          },
        },
      ],
    ],
  };
};
