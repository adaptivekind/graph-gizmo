import "@testing-library/jest-dom";
import {
  createPresentationGraph,
  filterEnrichedGraphWithRoot,
} from "../src/presentation-graph";
import { Graph } from "@adaptivekind/graph-schema";
import { GraphConfiguration } from "../src/types";
import { defaultConfiguration } from "../src";

describe("Search Depth Functionality", () => {
  // Create a multi-level graph to test search depth with unambiguous labels
  const createMultiLevelGraph = (): Graph => ({
    nodes: {
      root: { label: "Root" },
      alpha: { label: "Alpha Node" },
      beta: { label: "Beta Node" },
      gamma: { label: "Gamma Node" },
      delta: { label: "Delta Node" },
      epsilon: { label: "Epsilon Node" },
    },
    links: [
      { source: "root", target: "alpha" },
      { source: "root", target: "beta" },
      { source: "alpha", target: "gamma" },
      { source: "beta", target: "delta" },
      { source: "gamma", target: "epsilon" },
    ],
  });

  const createMockConfig = (
    searchDepth: number = 1,
    searchQuery: string = "Beta",
  ): GraphConfiguration =>
    defaultConfiguration({
      searchDepth,
      searchQuery,
    });

  describe("filterEnrichedGraphWithRoot with different search depths", () => {
    it("should include only direct matches with searchDepth = 0", () => {
      const graph = createMultiLevelGraph();
      const enrichedGraph = createPresentationGraph(
        "root",
        graph,
        {},
        createMockConfig(),
      );
      const config = createMockConfig(0);

      const result = filterEnrichedGraphWithRoot(enrichedGraph, config);

      // With searchDepth = 0, only nodes matching "Beta" should be included
      const nodeIds = result.nodes.map((n) => n.id).sort();
      expect(nodeIds).toEqual(["beta"]);
    });

    it("should include matches + 1 level with searchDepth = 1", () => {
      const graph = createMultiLevelGraph();
      const enrichedGraph = createPresentationGraph(
        "root",
        graph,
        {},
        createMockConfig(),
      );
      const config = createMockConfig(1);

      const result = filterEnrichedGraphWithRoot(enrichedGraph, config);

      // With searchDepth = 1, should include "beta" and its direct connections
      const nodeIds = result.nodes.map((n) => n.id).sort();
      expect(nodeIds).toContain("beta"); // The match
      expect(nodeIds).toContain("root"); // Connected to beta
      expect(nodeIds).toContain("delta"); // Connected to beta
      expect(nodeIds).not.toContain("alpha"); // Not directly connected
      expect(nodeIds).not.toContain("epsilon"); // Too far
    });

    it("should include matches + 2 levels with searchDepth = 2", () => {
      const graph = createMultiLevelGraph();
      const enrichedGraph = createPresentationGraph(
        "root",
        graph,
        {},
        createMockConfig(2, "Gamma"),
      );

      // With searchDepth = 2, should include "gamma" and nodes up to 2 levels away
      const nodeIds = enrichedGraph.nodes.map((n) => n.id).sort();
      expect(nodeIds).toContain("gamma"); // The match
      expect(nodeIds).toContain("alpha"); // 1 level from gamma
      expect(nodeIds).toContain("epsilon"); // 1 level from gamma
      expect(nodeIds).toContain("root"); // 2 levels from gamma
    });
  });
});
