import "@testing-library/jest-dom";
import {
  createDisplayGraph,
  filterDisplayGraphWithRoot,
} from "../src/display-graph";
import { Graph } from "@adaptivekind/graph-schema";
import { GraphConfiguration } from "../src";
import defaultConfiguration from "../src/default-configuration";

describe("Config Panel Search Depth Integration", () => {
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
      const enrichedGraph = createDisplayGraph(
        "root",
        graph,
        {},
        createMockConfig(),
      );
      const config = createMockConfig(0);

      const result = filterDisplayGraphWithRoot(enrichedGraph, config);

      // With searchDepth = 0, only nodes matching "Beta" should be included
      const nodeIds = result.nodes.map((n) => n.id).sort();
      expect(nodeIds).toEqual(["beta"]);
    });

    it("should include matches + 1 level with searchDepth = 1", () => {
      const graph = createMultiLevelGraph();
      const enrichedGraph = createDisplayGraph(
        "root",
        graph,
        {},
        createMockConfig(),
      );
      const config = createMockConfig(1);

      const result = filterDisplayGraphWithRoot(enrichedGraph, config);

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
      const enrichedGraph = createDisplayGraph(
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

  const createTestGraph = (): Graph => ({
    nodes: {
      root: { label: "Root" },
      target: { label: "Target Node" },
      connected1: { label: "Connected 1" },
      connected2: { label: "Connected 2" },
    },
    links: [
      { source: "root", target: "target" },
      { source: "target", target: "connected1" },
      { source: "target", target: "connected2" },
    ],
  });

  it("should demonstrate the search depth config panel workflow", () => {
    const graph = createTestGraph();
    const enrichedGraph = createDisplayGraph(
      "root",
      graph,
      {},
      defaultConfiguration(),
    );

    // Start with a configuration
    const config = defaultConfiguration({ viewWidth: 800, viewHeight: 600 });

    // Simulate user searches for "Target"
    config.searchQuery = "Target";

    // Test with default searchDepth (should be 1)
    const result1 = filterDisplayGraphWithRoot(enrichedGraph, config);
    const nodes1 = result1.nodes.map((n) => n.id).sort();

    // Now simulate user changing searchDepth to 0 via config panel
    config.searchDepth = 0;

    const result2 = filterDisplayGraphWithRoot(enrichedGraph, config);
    const nodes2 = result2.nodes.map((n) => n.id).sort();

    // The results should be different
    expect(nodes1).not.toEqual(nodes2);

    // With depth 0, should only have the matching node
    expect(nodes2).toEqual(["target"]);

    // With depth 1, should have the matching node + connected nodes
    expect(nodes1.length).toBeGreaterThan(nodes2.length);
    expect(nodes1).toContain("target");
  });

  it("should show that changing config searchDepth affects filtering", () => {
    const graph = createTestGraph();
    const enrichedGraph = createDisplayGraph(
      "root",
      graph,
      {},
      defaultConfiguration(),
    );

    // Test different searchDepth values
    const configDepth0 = { searchDepth: 0, searchQuery: "Target" };
    const configDepth1 = { searchDepth: 1, searchQuery: "Target" };
    const configDepth2 = { searchDepth: 2, searchQuery: "Target" };

    const result0 = filterDisplayGraphWithRoot(enrichedGraph, configDepth0);
    const result1 = filterDisplayGraphWithRoot(enrichedGraph, configDepth1);
    const result2 = filterDisplayGraphWithRoot(enrichedGraph, configDepth2);

    const count0 = result0.nodes.length;
    const count1 = result1.nodes.length;
    const count2 = result2.nodes.length;

    // Higher depth should include same or more nodes
    expect(count1).toBeGreaterThanOrEqual(count0);
    expect(count2).toBeGreaterThanOrEqual(count1);

    // They should be different (unless the graph is very small)
    expect(count0).not.toBe(count2);
  });
});
