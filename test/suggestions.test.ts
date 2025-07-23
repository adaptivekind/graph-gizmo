import { Graph } from "@adaptivekind/graph-schema";
import { findMatchingNodes } from "../src/suggestions";

describe("Config Panel Suggestions", () => {
  const mockGraph: Graph = {
    nodes: {
      box1: { label: "Box Storage" },
      box2: { label: "boxing" },
      container: { label: "storage box" },
      toolbox: { label: "tool-box" },
      mybox: { label: "my_box" },
      best: { label: "Best Practices" },
      practice: { label: "practice box" },
      boxcar: { label: "boxcar" },
      inbox: { label: "inbox" },
      xbox: { label: "xbox" },
      jelly1: { label: "boxofjelly" },
      jelly2: { label: "box.of.jelly" },
      jelly3: { label: "jelly beans" },
      jelly4: { label: "applejelly" },
    },
    links: [],
  };

  test("should filter suggestions for 'box' query correctly", () => {
    const suggestions = findMatchingNodes(mockGraph, "box", 20);
    const suggestionLabels = suggestions.map((s) => s.label);

    // Should include matches (limited to first 5 by slice)
    expect(suggestionLabels).toContain("Box Storage"); // starts with "box"
    expect(suggestionLabels).toContain("boxing"); // starts with "box"
    expect(suggestionLabels).toContain("boxcar"); // starts with "box"
    expect(suggestionLabels).toContain("inbox");
    expect(suggestionLabels).toContain("xbox");

    // Should NOT include false matches
    expect(suggestionLabels).not.toContain("Best Practices"); // "box" not in this string
  });

  test("should prioritize prefix matches", () => {
    const suggestions = findMatchingNodes(mockGraph, "box");
    const suggestionLabels = suggestions.map((s) => s.label);

    // Prefix matches should come first (alphabetically sorted within priority group)
    const prefixMatches = ["Box Storage", "boxcar", "boxing"];
    const wordBoundaryMatches = [
      "my_box",
      "practice box",
      "storage box",
      "tool-box",
    ];

    // Find indices of first prefix and first word boundary match
    const firstPrefixIndex = Math.min(
      ...prefixMatches
        .map((label) => suggestionLabels.indexOf(label))
        .filter((i) => i !== -1),
    );
    const firstWordBoundaryIndex = Math.min(
      ...wordBoundaryMatches
        .map((label) => suggestionLabels.indexOf(label))
        .filter((i) => i !== -1),
    );

    if (firstPrefixIndex !== -1 && firstWordBoundaryIndex !== -1) {
      expect(firstPrefixIndex).toBeLessThan(firstWordBoundaryIndex);
    }
  });

  test("should filter suggestions for 'jelly' query correctly", () => {
    const suggestions = findMatchingNodes(mockGraph, "jelly");
    const suggestionLabels = suggestions.map((s) => s.label);

    // Should include various types of matches
    expect(suggestionLabels).toContain("jelly beans"); // starts with "jelly"
    expect(suggestionLabels).toContain("boxofjelly"); // "jelly" after lowercase letters
    expect(suggestionLabels).toContain("applejelly"); // "jelly" after lowercase letters
    expect(suggestionLabels).toContain("box.of.jelly"); // "jelly" after dot

    // Should NOT include items that don't contain "jelly"
    expect(suggestionLabels).not.toContain("Best Practices");
    expect(suggestionLabels).not.toContain("Box Storage");

    // Test that all returned suggestions actually contain "jelly"
    suggestionLabels.forEach((label) => {
      expect(label.toLowerCase().includes("jelly")).toBe(true);
    });
  });
});
