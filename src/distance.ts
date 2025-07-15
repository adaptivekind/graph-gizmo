import { Graph } from "@adaptivekind/graph-schema";

export const UNCONNECTED_DISTANCE = 999;
/**
 * Calculate the shortest distance between two nodes in a graph using BFS.
 *
 * @param graph - The graph containing nodes and links
 * @param sourceId - The ID of the source node
 * @param targetId - The ID of the target node
 * @returns The shortest distance between the nodes, or -1 if no path exists
 */
export const getDistance = (
  graph: Graph,
  sourceId: string,
  targetId: string,
): number => {
  // Early return for same node
  if (sourceId === targetId) {
    return 0;
  }

  // Check if nodes exist in the graph
  if (!graph.nodes[sourceId] || !graph.nodes[targetId]) {
    return UNCONNECTED_DISTANCE;
  }

  // Build adjacency list for efficient traversal
  const adjacencyList: Record<string, string[]> = {};

  // Initialize adjacency list for all nodes
  Object.keys(graph.nodes).forEach((nodeId) => {
    adjacencyList[nodeId] = [];
  });

  // Populate adjacency list with bidirectional links
  graph.links.forEach((link) => {
    adjacencyList[link.source].push(link.target);
    adjacencyList[link.target].push(link.source);
  });

  // BFS to find shortest path
  const visited = new Set<string>();
  const queue: Array<{ nodeId: string; distance: number }> = [
    { nodeId: sourceId, distance: 0 },
  ];

  visited.add(sourceId);

  while (queue.length > 0) {
    const current = queue.shift()!;

    // Check if we've reached the target
    if (current.nodeId === targetId) {
      return current.distance;
    }

    // Explore neighbors
    for (const neighborId of adjacencyList[current.nodeId]) {
      if (!visited.has(neighborId)) {
        visited.add(neighborId);
        queue.push({
          nodeId: neighborId,
          distance: current.distance + 1,
        });
      }
    }
  }

  // No path found
  return UNCONNECTED_DISTANCE;
};
