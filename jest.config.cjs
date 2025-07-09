const config = {
  moduleNameMapper: {
    "^d3$": "<rootDir>/node_modules/d3/dist/d3.min.js",
    "^d3-quadtree$":
      "<rootDir>/node_modules/d3-quadtree/dist/d3-quadtree.min.js",
  },
  testEnvironment: "jsdom",
  testMatch: ["**/*.test.ts"],
  setupFiles: ["<rootDir>/test/setup.jest.ts"],
  globals: {
    TextEncoder: require("util").TextEncoder,
    TextDecoder: require("util").TextDecoder,
  },
};

module.exports = config;
