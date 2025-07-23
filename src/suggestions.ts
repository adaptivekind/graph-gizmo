import { Graph } from "@adaptivekind/graph-schema";

export const findMatchingNodes = (graph: Graph, query: string, max = 5) => {
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
    .slice(0, max)
    .map(([id, node]) => ({
      id,
      label: node?.label || id,
    }));
};
