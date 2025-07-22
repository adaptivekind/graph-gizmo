import { EnrichedGraph, EnrichedNodeDatum, InitialNodeValueMap } from "./types";
import { Graph, Link } from "@adaptivekind/graph-schema";
import { getDistance } from "./distance";

const nodeMatchesSearch = (
  node: EnrichedNodeDatum,
  searchQuery: string,
): boolean => {
  if (!searchQuery || searchQuery.trim() === "") {
    return true;
  }

  const query = searchQuery.toLowerCase().trim();
  const nodeLabel = (node.label || node.id).toLowerCase();
  const nodeId = node.id.toLowerCase();
  const nodeContext = (node.context || "").toLowerCase();

  return (
    nodeLabel.includes(query) ||
    nodeId.includes(query) ||
    nodeContext.includes(query)
  );
};

export const filterEnrichedGraph = (
  graph: EnrichedGraph,
  searchQuery: string,
): EnrichedGraph => {
  if (!searchQuery || searchQuery.trim() === "") {
    return graph;
  }

  const filteredNodes = graph.nodes.filter((node) =>
    nodeMatchesSearch(node, searchQuery),
  );

  const nodeIds = new Set(filteredNodes.map((node) => node.id));

  const filteredLinks = graph.links.filter((link) => {
    const sourceId =
      typeof link.source === "object" ? link.source.id : String(link.source);
    const targetId =
      typeof link.target === "object" ? link.target.id : String(link.target);
    return nodeIds.has(sourceId) && nodeIds.has(targetId);
  });

  return {
    nodes: filteredNodes,
    links: filteredLinks,
  };
};

export const createEnrichedGraph = (
  root: string,
  graph: Graph,
  initalValues: InitialNodeValueMap,
): EnrichedGraph => {
  const idsInView = [
    ...Object.keys(graph.nodes),
    ...graph.links.map((link) => [link.source, link.target]).flat(),
  ].filter((value, index, self) => self.indexOf(value) === index); // de-duplicate entries

  const getDepth = (id: string) =>
    getDistance({ nodes: graph.nodes, links: graph.links }, root, id);

  const nodes: EnrichedNodeDatum[] = [
    ...idsInView.map((id: string) => {
      const node = graph.nodes[id];
      const depth = getDepth(id);
      const fixedCoordinates = depth == 0 ? { fx: 0, fy: 0 } : {};
      return {
        id: id,
        label: node?.label || id,
        wanted: !(id in graph.nodes),
        showLabel: true,
        value: (node?.weights?.value || 0.5) / (1 + depth),
        depth,
        ...fixedCoordinates,
        ...initalValues[id],
      };
    }),
  ];

  const nodesMap = nodes.reduce(
    (
      map: Record<string, EnrichedNodeDatum>,
      node: EnrichedNodeDatum,
    ): Record<string, EnrichedNodeDatum> => {
      map[node.id] = node;
      return map;
    },
    {},
  );

  return {
    nodes: nodes,
    links: graph.links.map((link: Link) => {
      const depth = Math.min(
        nodesMap[link.source].depth,
        nodesMap[link.target].depth,
      );
      return {
        source: nodesMap[link.source],
        target: nodesMap[link.target],
        value: (link.weights?.value || 0.5) / (1 + depth),
        depth,
      };
    }),
  };
};
