import { getDistance } from "./distance";
import { builder } from "@adaptivekind/graph-schema";

describe("getDistance", () => {
  const testGraph = builder()
    .id("A")
    .to("B", "C")
    .id("B")
    .to("D")
    .id("D")
    .id("C")
    .to("E")
    .id("E")
    .build();

  it("should return 0 for distance to same node", () => {
    expect(getDistance(testGraph, "A", "A")).toBe(0);
  });

  it("should return 1 for directly connected nodes", () => {
    expect(getDistance(testGraph, "A", "B")).toBe(1);
    expect(getDistance(testGraph, "A", "C")).toBe(1);
    expect(getDistance(testGraph, "B", "D")).toBe(1);
  });

  it("should return correct distance for nodes 2 steps apart", () => {
    expect(getDistance(testGraph, "A", "D")).toBe(2);
    expect(getDistance(testGraph, "A", "E")).toBe(2);
  });

  it("should return correct distance for nodes 3 steps apart", () => {
    expect(getDistance(testGraph, "B", "E")).toBe(3);
    expect(getDistance(testGraph, "D", "E")).toBe(4);
  });

  it("should return -1 for non-existent source node", () => {
    expect(getDistance(testGraph, "X", "A")).toBe(-1);
  });

  it("should return -1 for non-existent target node", () => {
    expect(getDistance(testGraph, "A", "X")).toBe(-1);
  });

  it("should handle disconnected graph components", () => {
    const graph = builder()
      .id("A")
      .to("B")
      .id("B")
      .id("C")
      .to("D")
      .id("D")
      .build();

    expect(getDistance(graph, "A", "C")).toBe(-1);
    expect(getDistance(graph, "B", "D")).toBe(-1);
  });

  it("should handle empty graph", () => {
    const graph = builder().build();
    expect(getDistance(graph, "A", "B")).toBe(-1);
  });

  it("should handle single node graph", () => {
    const graph = builder().id("A").build();
    expect(getDistance(graph, "A", "A")).toBe(0);
    expect(getDistance(graph, "A", "B")).toBe(-1);
  });

  it("should handle bidirectional links correctly", () => {
    // Test symmetry - distance should be same in both directions
    expect(getDistance(testGraph, "A", "D")).toBe(
      getDistance(testGraph, "D", "A"),
    );
    expect(getDistance(testGraph, "B", "E")).toBe(
      getDistance(testGraph, "E", "B"),
    );
  });
});
