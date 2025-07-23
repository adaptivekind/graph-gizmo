import "@testing-library/jest-dom";
import {
  createEnrichedGraph,
  filterEnrichedGraphWithRoot,
} from "../src/presentation-graph";
import { Graph } from "@adaptivekind/graph-schema";
import { GraphConfiguration } from "../src/types";

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
    searchDepth: number,
    searchQuery: string = "Beta",
  ): { searchDepth: number; searchQuery: string } => ({
    searchDepth,
    searchQuery,
  });

  describe("filterEnrichedGraphWithRoot with different search depths", () => {
    it("should include only direct matches with searchDepth = 0", () => {
      const graph = createMultiLevelGraph();
      const enrichedGraph = createEnrichedGraph("root", graph, {});
      const config = createMockConfig(0);

      const result = filterEnrichedGraphWithRoot(enrichedGraph, config);

      // With searchDepth = 0, only nodes matching "Beta" should be included
      const nodeIds = result.filteredGraph.nodes.map((n) => n.id).sort();
      expect(nodeIds).toEqual(["beta"]);
    });

    it("should include matches + 1 level with searchDepth = 1", () => {
      const graph = createMultiLevelGraph();
      const enrichedGraph = createEnrichedGraph("root", graph, {});
      const config = createMockConfig(1);

      const result = filterEnrichedGraphWithRoot(enrichedGraph, config);

      // With searchDepth = 1, should include "beta" and its direct connections
      const nodeIds = result.filteredGraph.nodes.map((n) => n.id).sort();
      expect(nodeIds).toContain("beta"); // The match
      expect(nodeIds).toContain("root"); // Connected to beta
      expect(nodeIds).toContain("delta"); // Connected to beta
      expect(nodeIds).not.toContain("alpha"); // Not directly connected
      expect(nodeIds).not.toContain("epsilon"); // Too far
    });

    it("should include matches + 2 levels with searchDepth = 2", () => {
      const graph = createMultiLevelGraph();
      const enrichedGraph = createEnrichedGraph("root", graph, {});

      const result = filterEnrichedGraphWithRoot(
        enrichedGraph,
        createMockConfig(2, "Gamma"),
      );

      // With searchDepth = 2, should include "gamma" and nodes up to 2 levels away
      const nodeIds = result.filteredGraph.nodes.map((n) => n.id).sort();
      expect(nodeIds).toContain("gamma"); // The match
      expect(nodeIds).toContain("alpha"); // 1 level from gamma
      expect(nodeIds).toContain("epsilon"); // 1 level from gamma
      expect(nodeIds).toContain("root"); // 2 levels from gamma
    });

    it("should demonstrate different results for same search with different depths", () => {
      const graph = createMultiLevelGraph();
      const enrichedGraph = createEnrichedGraph("root", graph, {});

      const result1 = filterEnrichedGraphWithRoot(
        enrichedGraph,
        createMockConfig(1, "Gamma"),
      );

      const result2 = filterEnrichedGraphWithRoot(
        enrichedGraph,
        createMockConfig(2, "Gamma"),
      );

      const nodes1 = result1.filteredGraph.nodes.map((n) => n.id).sort();
      const nodes2 = result2.filteredGraph.nodes.map((n) => n.id).sort();

      // Results should be different
      expect(nodes1).not.toEqual(nodes2);

      // Higher depth should include more or equal nodes
      expect(nodes2.length).toBeGreaterThanOrEqual(nodes1.length);
    });
  });

  describe("Integration test with GraphConfiguration", () => {
    it("should use searchDepth from GraphConfiguration object", () => {
      const graph = createMultiLevelGraph();
      const enrichedGraph = createEnrichedGraph("root", graph, {});

      // Test with a partial GraphConfiguration that includes searchDepth and searchQuery
      const configWithDepth1 = {
        searchDepth: 1,
        searchQuery: "Gamma",
      } as GraphConfiguration;
      const configWithDepth2 = {
        searchDepth: 2,
        searchQuery: "Gamma",
      } as GraphConfiguration;

      const result1 = filterEnrichedGraphWithRoot(
        enrichedGraph,
        configWithDepth1,
      );

      const result2 = filterEnrichedGraphWithRoot(
        enrichedGraph,
        configWithDepth2,
      );

      const nodes1 = result1.filteredGraph.nodes.map((n) => n.id);
      const nodes2 = result2.filteredGraph.nodes.map((n) => n.id);

      // Different searchDepth values should produce different results
      expect(nodes1.length).not.toBe(nodes2.length);
    });
  });
});
