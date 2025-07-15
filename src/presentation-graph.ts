import { EnrichedGraph, EnrichedNodeDatum, InitialNodeValueMap } from "./types";
import { Graph, Link } from "@adaptivekind/graph-schema";
import { getDistance } from "./distance";

export const createEnrichedGraph = (
  root: string,
  graph: Graph,
  initalValues: InitialNodeValueMap,
): EnrichedGraph => {
  const idsInView = graph.links
    .map((link) => [link.source, link.target])
    .flat()
    .filter((value, index, self) => self.indexOf(value) === index);

  const getDepth = (id: string) => getDistance(graph, root, id);

  const nodes: EnrichedNodeDatum[] = [
    ...idsInView.map((id: string) => {
      const node = graph.nodes[id];
      const depth = getDepth(id);
      const fixedCoordinates = depth == 0 ? { fx: 0, fy: 0 } : {};
      return {
        id: id,
        label: id in graph.nodes && node.label ? node.label : id,
        wanted: !(id in graph.nodes),
        showLabel: true,
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
      return {
        source: nodesMap[link.source],
        target: nodesMap[link.target],
        depth: Math.min(
          nodesMap[link.source].depth,
          nodesMap[link.target].depth,
        ),
      };
    }),
  };
};
