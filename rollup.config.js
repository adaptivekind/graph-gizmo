import typescript from "@rollup/plugin-typescript";

export default {
  input: "src/index.ts",
  output: {
    file: "dist/graph-gizmo.js",
    format: "umd",
    name: "graphGizmo",
    globals: {
      d3: "d3",
      "d3-quadtree": "d3",
      "@adaptivekind/graph-schema": "graphSchema",
    },
  },
  external: ["d3", "d3-quadtree", "@adaptivekind/graph-schema"],
  plugins: [typescript()],
};
