import typescript from "@rollup/plugin-typescript";
import copy from "rollup-plugin-copy";
import { nodeResolve } from "@rollup/plugin-node-resolve";

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
  external: ["d3", "d3-quadtree"],
  plugins: [
    typescript(),
    copy({
      targets: [{ src: "src/themes/default.css", dest: "dist/" }],
    }),
    nodeResolve(),
  ],
};
