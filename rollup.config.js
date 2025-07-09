import typescript from "@rollup/plugin-typescript";

export default {
  input: "src/index.ts",
  output: {
    file: "dist/bundle.js",
    format: "umd",
    name: "linkGraph",
    globals: {
      d3: "d3",
      "d3-quadtree": "d3",
      "@adaptivekind/graph-schema": "graphSchema",
    },
  },
  external: ["d3", "d3-quadtree", "@adaptivekind/graph-schema"],
  plugins: [typescript()],
};
