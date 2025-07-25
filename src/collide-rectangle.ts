import { QuadtreeInternalNode, QuadtreeLeaf, quadtree } from "d3-quadtree";

import { EnrichedNodeDatum } from "./types";

function x(d: EnrichedNodeDatum) {
  return d.x ?? 0;
}

function y(d: EnrichedNodeDatum) {
  return d.y ?? 0;
}

function xCenterOfBox(d: EnrichedNodeDatum, box: number[]) {
  return (d.x ?? 0) + box[0] + box[2] / 2;
}

function yCenterOfBox(d: EnrichedNodeDatum, box: number[]) {
  return (d.y ?? 0) + box[1] + box[3] / 2;
}

// box is [x,y,width,height]
function apply(d: EnrichedNodeDatum, box: number[], strength: number) {
  return (
    quad:
      | QuadtreeInternalNode<EnrichedNodeDatum>
      | QuadtreeLeaf<EnrichedNodeDatum>,
  ) => {
    if (quad.length === 4 || !d) {
      return;
    }
    if ((quad.data.index ?? 0) <= (d.index ?? 0)) {
      // only apply force between 2 nodes once
      return;
    }
    const quadDataXCenter = xCenterOfBox(quad.data, box);
    const quadDataYCenter = yCenterOfBox(quad.data, box);
    const dXCenter = xCenterOfBox(d, box);
    const dYCenter = yCenterOfBox(d, box);

    const xDistance = (dXCenter - quadDataXCenter) * 4;
    const yDistance = dYCenter - quadDataYCenter;
    const absX = Math.abs(xDistance);
    const absY = Math.abs(yDistance);
    const overlapX = absX - box[2];
    const overlapY = absY - box[3];

    // Adjust nodes after collision
    if (overlapX < 0 && overlapY < 0) {
      const distance = Math.sqrt(xDistance * xDistance + yDistance * yDistance);

      // Move nodes vertically
      const deltaY = (strength * yDistance * overlapY) / distance;
      d.vy = (d.vy ?? 0) - deltaY / 2;
      quad.data.vy = (quad.data.vy ?? 0) + deltaY / 2;

      // Move nodes horizonstally with less strength
      const deltaX = (0.00005 * strength * xDistance * overlapX) / distance;
      d.vx = (d.vx ?? 0) - deltaX / 2;
      quad.data.vx = (quad.data.vx ?? 0) + deltaX / 2;

      return true;
    }
  };
}

export default function (box: number[], strength = 0.8) {
  let nodes: EnrichedNodeDatum[];
  let iterations = 1;
  function force() {
    const tree = quadtree(nodes, x, y);

    // When iterations set then we automatically run given number of iterations
    for (let k = 0; k < iterations; ++k) {
      for (const d of nodes) {
        tree.visit(apply(d, box, strength));
      }
    }
  }
  force.iterations = function (_: string | number) {
    return arguments.length ? ((iterations = +_), force) : iterations;
  };

  force.initialize = (_: EnrichedNodeDatum[]) =>
    (nodes = _.filter((node) => node.showLabel));
  return force;
}
