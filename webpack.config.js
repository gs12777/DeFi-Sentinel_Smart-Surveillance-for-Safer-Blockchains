const path = require("path");

module.exports = {
  resolve: {
    fallback: {
      "path": require.resolve("path-browserify"),
      "os": require.resolve("os-browserify/browser"),
      "stream": require.resolve("stream-browserify"),
      "util": require.resolve("util/"),
      "fs": false,
      "child_process": false
    }
  }
};
