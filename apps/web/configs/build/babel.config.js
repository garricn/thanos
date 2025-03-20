// Babel configuration for the web app
/** @type {import('@babel/core').TransformOptions} */
const config = {
  presets: [
    ["@babel/preset-env", { targets: { node: "current" } }],
    ["@babel/preset-react", { runtime: "automatic" }],
    "@babel/preset-typescript",
  ],
};

module.exports = config;
