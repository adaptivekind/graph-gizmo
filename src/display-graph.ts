import {
  DisplayGraph,
  EnrichedNodeDatum,
  GraphConfiguration,
  InitialNodeValueMap,
} from "./types";
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

const nodeExactlyMatches = (
  node: EnrichedNodeDatum,
  searchQuery: string,
): boolean => {
  if (!searchQuery || searchQuery.trim() === "") {
    return false;
  }

  const query = searchQuery.toLowerCase().trim();
  const nodeLabel = (node.label || node.id).toLowerCase();
  const nodeId = node.id.toLowerCase();

  return nodeLabel === query || nodeId === query;
};

const getNodesWithinDepth = (
  graph: DisplayGraph,
  matchingNodeIds: Set<string>,
  depth: number,
): Set<string> => {
  if (depth === 0) {
    return matchingNodeIds;
  }

  const result = new Set(matchingNodeIds);
  const currentLevel = new Set(matchingNodeIds);

  for (let level = 0; level < depth; level++) {
    const nextLevel = new Set<string>();

    for (const nodeId of currentLevel) {
      graph.links.forEach((link) => {
        const sourceId =
          typeof link.source === "object"
            ? link.source.id
            : String(link.source);
        const targetId =
          typeof link.target === "object"
            ? link.target.id
            : String(link.target);

        if (sourceId === nodeId && !result.has(targetId)) {
          result.add(targetId);
          nextLevel.add(targetId);
        }
        if (targetId === nodeId && !result.has(sourceId)) {
          result.add(sourceId);
          nextLevel.add(sourceId);
        }
      });
    }

    currentLevel.clear();
    for (const nodeId of nextLevel) {
      currentLevel.add(nodeId);
    }

    if (nextLevel.size === 0) {
      break;
    }
  }

  return result;
};

export const filterDisplayGraphWithRoot = (
  graph: DisplayGraph,
  config: { searchDepth: number; searchQuery: string },
): DisplayGraph => {
  if (!config.searchQuery || config.searchQuery.trim() === "") {
    return graph;
  }

  const matchingNodes = graph.nodes.filter((node) =>
    nodeMatchesSearch(node, config.searchQuery),
  );

  let suggestedRootId: string | undefined;

  // Check for exact match first
  const exactMatches = matchingNodes.filter((node) =>
    nodeExactlyMatches(node, config.searchQuery),
  );

  if (exactMatches.length === 1) {
    suggestedRootId = exactMatches[0].id;
  } else if (matchingNodes.length === 1) {
    // If only one node matches, make it the root
    suggestedRootId = matchingNodes[0].id;
  }

  const matchingNodeIds = new Set(matchingNodes.map((node) => node.id));
  const nodeIdsWithDepth = getNodesWithinDepth(
    graph,
    matchingNodeIds,
    config.searchDepth,
  );

  const filteredNodes = graph.nodes.filter((node) =>
    nodeIdsWithDepth.has(node.id),
  );

  const filteredLinks = graph.links.filter((link) => {
    const sourceId =
      typeof link.source === "object" ? link.source.id : String(link.source);
    const targetId =
      typeof link.target === "object" ? link.target.id : String(link.target);
    return nodeIdsWithDepth.has(sourceId) && nodeIdsWithDepth.has(targetId);
  });

  return {
    nodes: filteredNodes,
    links: filteredLinks,
    rootId: suggestedRootId || graph.rootId,
  };
};

export const createDisplayGraph = (
  root: string,
  graph: Graph,
  initalValues: InitialNodeValueMap,
  config: GraphConfiguration,
): DisplayGraph => {
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

  const links = graph.links.map((link: Link) => {
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
  });

  return filterDisplayGraphWithRoot(
    {
      nodes,
      links,
      rootId: root,
    },
    config,
  );
};
