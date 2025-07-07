import { Graph } from "@adaptivekind/graph-schema";

export default (graph: Graph, name: string) => {
  const childName = window.location.hash;
  const compositeName = name + childName;
  return compositeName in graph.nodes ? compositeName : name;
};
