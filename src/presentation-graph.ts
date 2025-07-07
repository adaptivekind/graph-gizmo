import { Graph, Link } from "@adaptivekind/graph-schema";
import {
  PresentationGraph,
  InitialNodeValueMap,
  GraphNodeDatum,
} from "./types";

export const createPresentationGraph = (
  root: string,
  graph: Graph,
  initalValues: InitialNodeValueMap,
): PresentationGraph => {
  const idsInView = graph.links
    .map((link) => [link.source, link.target])
    .flat()
    .filter((value, index, self) => self.indexOf(value) === index);

  const nodes: GraphNodeDatum[] = [
    ...idsInView.map((id: string) => {
      const fixedCoordinates = {};
      const node = graph.nodes[id];
      return {
        id: id,
        label: id in graph.nodes && node.label ? node.label : id,
        wanted: !(id in graph.nodes),
        showLabel: true,
        ...initalValues[id],
        ...fixedCoordinates,
      };
    }),
  ];

  const nodesMap = nodes.reduce(
    (
      map: Record<string, GraphNodeDatum>,
      node: GraphNodeDatum,
    ): Record<string, GraphNodeDatum> => {
      map[node.id] = node;
      return map;
    },
    {},
  );

  return {
    nodes: nodes,
    links: graph.links.map((link) => {
      return {
        source: nodesMap[link.source],
        target: nodesMap[link.target],
      };
    }),
  };
};
