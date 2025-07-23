import "@testing-library/jest-dom";
import {
  createPresentationGraph,
  filterEnrichedGraphWithRoot,
} from "../src/presentation-graph";
import { Graph } from "@adaptivekind/graph-schema";
import defaultConfiguration from "../src/default-configuration";

describe("Config Panel Search Depth Integration", () => {
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
    const enrichedGraph = createPresentationGraph("root", graph, {});

    // Start with a configuration
    const config = defaultConfiguration({ viewWidth: 800, viewHeight: 600 });

    // Simulate user searches for "Target"
    config.searchQuery = "Target";

    // Test with default searchDepth (should be 1)
    const result1 = filterEnrichedGraphWithRoot(enrichedGraph, config);
    const nodes1 = result1.filteredGraph.nodes.map((n) => n.id).sort();

    // Now simulate user changing searchDepth to 0 via config panel
    config.searchDepth = 0;

    const result2 = filterEnrichedGraphWithRoot(enrichedGraph, config);
    const nodes2 = result2.filteredGraph.nodes.map((n) => n.id).sort();

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
    const enrichedGraph = createPresentationGraph("root", graph, {});

    // Test different searchDepth values
    const configDepth0 = { searchDepth: 0, searchQuery: "Target" };
    const configDepth1 = { searchDepth: 1, searchQuery: "Target" };
    const configDepth2 = { searchDepth: 2, searchQuery: "Target" };

    const result0 = filterEnrichedGraphWithRoot(enrichedGraph, configDepth0);
    const result1 = filterEnrichedGraphWithRoot(enrichedGraph, configDepth1);
    const result2 = filterEnrichedGraphWithRoot(enrichedGraph, configDepth2);

    const count0 = result0.filteredGraph.nodes.length;
    const count1 = result1.filteredGraph.nodes.length;
    const count2 = result2.filteredGraph.nodes.length;

    // Higher depth should include same or more nodes
    expect(count1).toBeGreaterThanOrEqual(count0);
    expect(count2).toBeGreaterThanOrEqual(count1);

    // They should be different (unless the graph is very small)
    expect(count0).not.toBe(count2);
  });
});
