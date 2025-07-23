import "@testing-library/jest-dom";
import { EnrichedNodeDatum, InitialNodeValueMap } from "../src/types";
import { Graph } from "@adaptivekind/graph-schema";
import { createDisplayGraph } from "../src/display-graph";
import { defaultConfiguration } from "../src";

describe("createPresentationGraph", () => {
  const createTestGraph = (): Graph => ({
    nodes: {
      root: { label: "Root Node", weights: { value: 1.0 } },
      child1: { label: "Child 1", weights: { value: 0.8 } },
      child2: { label: "Child 2", weights: { value: 0.6 } },
      grandchild: { label: "Grandchild", weights: { value: 0.4 } },
    },
    links: [
      { source: "root", target: "child1", weights: { value: 0.9 } },
      { source: "root", target: "child2", weights: { value: 0.7 } },
      { source: "child1", target: "grandchild", weights: { value: 0.5 } },
    ],
  });

  const createMinimalGraph = (): Graph => ({
    nodes: {
      single: { label: "Single Node" },
    },
    links: [],
  });

  describe("node creation", () => {
    it("should create enriched nodes from graph nodes", () => {
      const graph = createTestGraph();
      const result = createDisplayGraph(
        "root",
        graph,
        {},
        defaultConfiguration({}),
      );

      expect(result.nodes).toHaveLength(4);
      expect(result.nodes.map((n) => n.id)).toEqual([
        "root",
        "child1",
        "child2",
        "grandchild",
      ]);
    });

    it("should set correct labels for nodes", () => {
      const graph = createTestGraph();
      const result = createDisplayGraph(
        "root",
        graph,
        {},
        defaultConfiguration(),
      );

      const rootNode = result.nodes.find((n) => n.id === "root");
      expect(rootNode?.label).toBe("Root Node");

      const child1Node = result.nodes.find((n) => n.id === "child1");
      expect(child1Node?.label).toBe("Child 1");
    });

    it("should use node id as label when label is missing", () => {
      const graph: Graph = {
        nodes: {
          noLabel: {},
        },
        links: [],
      };
      const result = createDisplayGraph(
        "noLabel",
        graph,
        {},
        defaultConfiguration(),
      );

      const node = result.nodes.find((n) => n.id === "noLabel");
      expect(node?.label).toBe("noLabel");
    });

    it("should calculate correct depth for nodes", () => {
      const graph = createTestGraph();
      const result = createDisplayGraph(
        "root",
        graph,
        {},
        defaultConfiguration(),
      );

      const rootNode = result.nodes.find((n) => n.id === "root");
      expect(rootNode?.depth).toBe(0);

      const child1Node = result.nodes.find((n) => n.id === "child1");
      expect(child1Node?.depth).toBe(1);

      const grandchildNode = result.nodes.find((n) => n.id === "grandchild");
      expect(grandchildNode?.depth).toBe(2);
    });

    it("should set wanted flag correctly", () => {
      const graph = createTestGraph();
      const result = createDisplayGraph(
        "root",
        graph,
        {},
        defaultConfiguration(),
      );

      result.nodes.forEach((node) => {
        expect(node.wanted).toBe(false);
      });
    });

    it("should mark nodes as wanted when they exist in links but not in nodes", () => {
      const graph: Graph = {
        nodes: {
          existing: { label: "Existing Node" },
        },
        links: [
          { source: "existing", target: "missing", weights: { value: 1 } },
        ],
      };
      const result = createDisplayGraph(
        "existing",
        graph,
        {},
        defaultConfiguration(),
      );

      const existingNode = result.nodes.find((n) => n.id === "existing");
      expect(existingNode?.wanted).toBe(false);

      const missingNode = result.nodes.find((n) => n.id === "missing");
      expect(missingNode?.wanted).toBe(true);
      expect(missingNode?.label).toBe("missing");
    });

    it("should calculate node values based on weights and depth", () => {
      const graph = createTestGraph();
      const result = createDisplayGraph(
        "root",
        graph,
        {},
        defaultConfiguration(),
      );

      const rootNode = result.nodes.find((n) => n.id === "root");
      expect(rootNode?.value).toBe(1.0 / (1 + 0)); // weight / (1 + depth)

      const child1Node = result.nodes.find((n) => n.id === "child1");
      expect(child1Node?.value).toBe(0.8 / (1 + 1)); // weight / (1 + depth)

      const grandchildNode = result.nodes.find((n) => n.id === "grandchild");
      expect(grandchildNode?.value).toBe(0.4 / (1 + 2)); // weight / (1 + depth)
    });

    it("should use default weight when node has no weight", () => {
      const graph: Graph = {
        nodes: {
          noWeight: { label: "No Weight Node" },
        },
        links: [],
      };
      const result = createDisplayGraph(
        "noWeight",
        graph,
        {},
        defaultConfiguration(),
      );

      const node = result.nodes.find((n) => n.id === "noWeight");
      expect(node?.value).toBe(1 / (1 + 0)); // default weight 0.5 / (1 + depth)
    });

    it("should fix root node coordinates", () => {
      const graph = createTestGraph();
      const result = createDisplayGraph(
        "root",
        graph,
        {},
        defaultConfiguration(),
      );

      const rootNode = result.nodes.find((n) => n.id === "root");
      expect(rootNode?.fx).toBe(0);
      expect(rootNode?.fy).toBe(0);
    });

    it("should not fix non-root node coordinates", () => {
      const graph = createTestGraph();
      const result = createDisplayGraph(
        "root",
        graph,
        {},
        defaultConfiguration(),
      );

      const child1Node = result.nodes.find((n) => n.id === "child1");
      expect(child1Node?.fx).toBeUndefined();
      expect(child1Node?.fy).toBeUndefined();
    });

    it("should apply initial values to nodes", () => {
      const graph = createTestGraph();
      const initialValues: InitialNodeValueMap = {
        child1: { x: 100, y: 200, fx: 150, fy: 250 },
        child2: { vx: 10, vy: 20 },
      };
      const result = createDisplayGraph(
        "root",
        graph,
        initialValues,
        defaultConfiguration(),
      );

      const child1Node = result.nodes.find((n) => n.id === "child1");
      expect(child1Node?.x).toBe(100);
      expect(child1Node?.y).toBe(200);
      expect(child1Node?.fx).toBe(150);
      expect(child1Node?.fy).toBe(250);

      const child2Node = result.nodes.find((n) => n.id === "child2");
      expect(child2Node?.vx).toBe(10);
      expect(child2Node?.vy).toBe(20);
    });

    it("should set showLabel to true for all nodes", () => {
      const graph = createTestGraph();
      const result = createDisplayGraph(
        "root",
        graph,
        {},
        defaultConfiguration(),
      );

      result.nodes.forEach((node) => {
        expect(node.showLabel).toBe(true);
      });
    });
  });

  describe("link creation", () => {
    it("should create enriched links from graph links", () => {
      const graph = createTestGraph();
      const result = createDisplayGraph(
        "root",
        graph,
        {},
        defaultConfiguration(),
      );

      expect(result.links).toHaveLength(3);
    });

    it("should set correct source and target node references", () => {
      const graph = createTestGraph();
      const result = createDisplayGraph(
        "root",
        graph,
        {},
        defaultConfiguration(),
      );

      const firstLink = result.links[0];
      expect(firstLink.source).toBeDefined();
      expect(firstLink.target).toBeDefined();
      expect((firstLink.source as EnrichedNodeDatum).id).toBe("root");
      expect((firstLink.target as EnrichedNodeDatum).id).toBe("child1");
    });

    it("should set link values from weights", () => {
      const graph = createTestGraph();
      const result = createDisplayGraph(
        "root",
        graph,
        {},
        defaultConfiguration(),
      );

      const firstLink = result.links[0];
      expect(firstLink.value).toBe(0.9);

      const secondLink = result.links[1];
      expect(secondLink.value).toBe(0.7);
    });

    it("should use default value when link has no weight", () => {
      const graph: Graph = {
        nodes: {
          node1: { label: "Node 1" },
          node2: { label: "Node 2" },
        },
        links: [{ source: "node1", target: "node2" }],
      };
      const result = createDisplayGraph(
        "node1",
        graph,
        {},
        defaultConfiguration(),
      );

      expect(result.links[0].value).toBe(1);
    });

    it("should calculate link depth as minimum of source and target depths", () => {
      const graph = createTestGraph();
      const result = createDisplayGraph(
        "root",
        graph,
        {},
        defaultConfiguration(),
      );

      const rootToChild1Link = result.links.find(
        (link) =>
          (link.source as EnrichedNodeDatum).id === "root" &&
          (link.target as EnrichedNodeDatum).id === "child1",
      );
      expect(rootToChild1Link?.depth).toBe(0); // min(0, 1) = 0

      const child1ToGrandchildLink = result.links.find(
        (link) =>
          (link.source as EnrichedNodeDatum).id === "child1" &&
          (link.target as EnrichedNodeDatum).id === "grandchild",
      );
      expect(child1ToGrandchildLink?.depth).toBe(1); // min(1, 2) = 1
    });
  });

  describe("deduplication", () => {
    it("should deduplicate node IDs from nodes and links", () => {
      const graph: Graph = {
        nodes: {
          node1: { label: "Node 1" },
          node2: { label: "Node 2" },
        },
        links: [
          { source: "node1", target: "node2", weights: { value: 0.5 } },
          { source: "node2", target: "node1", weights: { value: 0.5 } },
        ],
      };
      const result = createDisplayGraph(
        "node1",
        graph,
        {},
        defaultConfiguration(),
      );

      expect(result.nodes).toHaveLength(2);
      expect(result.nodes.map((n) => n.id).sort()).toEqual(["node1", "node2"]);
    });
  });

  describe("edge cases", () => {
    it("should handle single node graph", () => {
      const graph = createMinimalGraph();
      const result = createDisplayGraph(
        "single",
        graph,
        {},
        defaultConfiguration(),
      );

      expect(result.nodes).toHaveLength(1);
      expect(result.links).toHaveLength(0);
      expect(result.nodes[0].id).toBe("single");
      expect(result.nodes[0].depth).toBe(0);
    });

    it("should handle empty graph", () => {
      const graph: Graph = { nodes: {}, links: [] };
      const result = createDisplayGraph(
        "nonexistent",
        graph,
        {},
        defaultConfiguration(),
      );

      expect(result.nodes).toHaveLength(0);
      expect(result.links).toHaveLength(0);
    });

    it("should handle graph with disconnected components", () => {
      const graph: Graph = {
        nodes: {
          root: { label: "Root" },
          connected: { label: "Connected" },
          isolated: { label: "Isolated" },
        },
        links: [
          { source: "root", target: "connected", weights: { value: 0.5 } },
        ],
      };
      const result = createDisplayGraph(
        "root",
        graph,
        {},
        defaultConfiguration(),
      );

      expect(result.nodes).toHaveLength(3);
      expect(result.links).toHaveLength(1);

      const isolatedNode = result.nodes.find((n) => n.id === "isolated");
      expect(isolatedNode?.depth).toBe(Infinity);
    });

    it("should handle circular references", () => {
      const graph: Graph = {
        nodes: {
          node1: { label: "Node 1" },
          node2: { label: "Node 2" },
        },
        links: [
          { source: "node1", target: "node2", weights: { value: 0.5 } },
          { source: "node2", target: "node1", weights: { value: 0.5 } },
        ],
      };
      const result = createDisplayGraph(
        "node1",
        graph,
        {},
        defaultConfiguration(),
      );

      expect(result.nodes).toHaveLength(2);
      expect(result.links).toHaveLength(2);

      const node1 = result.nodes.find((n) => n.id === "node1");
      const node2 = result.nodes.find((n) => n.id === "node2");
      expect(node1?.depth).toBe(0);
      expect(node2?.depth).toBe(1);
    });

    it("should reproduce TypeError when links reference missing nodes", () => {
      // Create a graph where we have a link that references a node that doesn't exist
      // This will cause adjacencyList[link.source] to be undefined when we try to push
      const graph: Graph = {
        nodes: {
          start: { label: "Start Node" },
          end: { label: "End Node" },
        },
        links: [
          { source: "start", target: "missing", weights: { value: 0.5 } },
          { source: "missing", target: "end", weights: { value: 0.5 } },
        ],
      };

      const result = createDisplayGraph(
        "start",
        graph,
        {},
        defaultConfiguration(),
      );
      expect(result.nodes).toHaveLength(3);
      expect(result.links).toHaveLength(2);
    });
  });
});
