import { Graph } from "@adaptivekind/graph-schema";

// Mock the suggestion filtering logic for testing
const filterSuggestions = (
  graph: Graph,
  query: string,
): Array<{ id: string; label: string }> => {
  if (!query || query.trim() === "") {
    return [];
  }

  const lowerQuery = query.toLowerCase().trim();

  return Object.entries(graph.nodes)
    .filter(([id, node]) => {
      const nodeLabel = (node?.label || id).toLowerCase();
      const nodeId = id.toLowerCase();

      // Match if query appears at start, after word boundaries, or after common separators/lowercase letters
      const startsWithRegex = new RegExp(
        `^${lowerQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`,
        "i",
      );
      const wordBoundaryRegex = new RegExp(
        `[\\s\\-_\\.]${lowerQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`,
        "i",
      );
      const afterWordRegex = new RegExp(
        `[a-z]${lowerQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`,
        "i",
      );

      const labelMatches =
        startsWithRegex.test(nodeLabel) ||
        wordBoundaryRegex.test(nodeLabel) ||
        afterWordRegex.test(nodeLabel);
      const idMatches =
        startsWithRegex.test(nodeId) ||
        wordBoundaryRegex.test(nodeId) ||
        afterWordRegex.test(nodeId);

      // Exclude exact matches
      return (
        (labelMatches || idMatches) &&
        nodeLabel !== lowerQuery &&
        nodeId !== lowerQuery
      );
    })
    .sort(([aId, aNode], [bId, bNode]) => {
      // Prioritize exact starts with matches
      const aLabel = (aNode?.label || aId).toLowerCase();
      const bLabel = (bNode?.label || bId).toLowerCase();
      const aStartsWith =
        aLabel.startsWith(lowerQuery) ||
        aId.toLowerCase().startsWith(lowerQuery);
      const bStartsWith =
        bLabel.startsWith(lowerQuery) ||
        bId.toLowerCase().startsWith(lowerQuery);

      if (aStartsWith && !bStartsWith) return -1;
      if (!aStartsWith && bStartsWith) return 1;

      // Then sort alphabetically
      return aLabel.localeCompare(bLabel);
    })
    .slice(0, 5)
    .map(([id, node]) => ({
      id,
      label: node?.label || id,
    }));
};

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
    const suggestions = filterSuggestions(mockGraph, "box");
    const suggestionLabels = suggestions.map((s) => s.label);

    // Should include matches (limited to first 5 by slice)
    expect(suggestionLabels).toContain("Box Storage"); // starts with "box"
    expect(suggestionLabels).toContain("boxing"); // starts with "box"
    expect(suggestionLabels).toContain("boxcar"); // starts with "box"

    // Should NOT include false matches
    expect(suggestionLabels).not.toContain("Best Practices"); // "box" not in this string
    expect(suggestionLabels).not.toContain("inbox"); // "box" is not at word boundary
    expect(suggestionLabels).not.toContain("xbox"); // "box" is not at word boundary

    // Test that all returned suggestions are valid matches
    suggestionLabels.forEach((label) => {
      const lowerLabel = label.toLowerCase();
      const wordBoundaryRegex = new RegExp(`(^|\\s|-|_)box`, "i");
      expect(wordBoundaryRegex.test(lowerLabel)).toBe(true);
    });
  });

  test("should return empty array for empty query", () => {
    const suggestions = filterSuggestions(mockGraph, "");
    expect(suggestions).toEqual([]);
  });

  test("should exclude exact matches", () => {
    const graphWithExact: Graph = {
      nodes: {
        box: { label: "box" },
        boxing: { label: "boxing" },
      },
      links: [],
    };

    const suggestions = filterSuggestions(graphWithExact, "box");
    const suggestionLabels = suggestions.map((s) => s.label);

    expect(suggestionLabels).toContain("boxing");
    expect(suggestionLabels).not.toContain("box"); // exact match should be excluded
  });

  test("should prioritize prefix matches", () => {
    const suggestions = filterSuggestions(mockGraph, "box");
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
    const suggestions = filterSuggestions(mockGraph, "jelly");
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
