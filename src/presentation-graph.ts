import { EnrichedGraph, EnrichedNodeDatum, InitialNodeValueMap } from "./types";
import { Graph, Link } from "@adaptivekind/graph-schema";
import { getDistance } from "./distance";

export const createEnrichedGraph = (
  root: string,
  graph: Graph,
  initalValues: InitialNodeValueMap,
): EnrichedGraph => {
  const links = graph.links.filter((link) => link.target in graph.nodes); // ensure that id references an existing node

  const idsInView = links
    .map((link) => [link.source, link.target])
    .flat()
    .filter((value, index, self) => self.indexOf(value) === index); // de-duplicate entries

  const getDepth = (id: string) =>
    getDistance({ nodes: graph.nodes, links }, root, id);

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
        value: node.weights?.value || 0.5,
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
    links: links.map((link: Link) => {
      return {
        source: nodesMap[link.source],
        target: nodesMap[link.target],
        value: link.weights?.value || 0.5,
        depth: Math.min(
          nodesMap[link.source].depth,
          nodesMap[link.target].depth,
        ),
      };
    }),
  };
};
