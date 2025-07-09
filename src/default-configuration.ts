import { Link } from "@adaptivekind/graph-schema";
import { SimulationNodeDatum } from "d3";

import { GraphConfiguration, GraphLink, GraphNode } from "./types";
const DEPTH_1_RADIUS = 30;
const boundarySize = DEPTH_1_RADIUS * 4;

const linkTypeForceWeight = () => {
  return 1;
};

const linkDepthForceWeight = () => 1;

type DefaultConfigurationParameters = {
  viewWidth: number;
  viewHeight: number;
};

const defaultConfiguration = (
  parameters: DefaultConfigurationParameters,
): GraphConfiguration => {
  const viewHeight = parameters.viewHeight;
  const viewWidth = parameters.viewWidth;
  const minDimension = Math.min(viewWidth, viewHeight);
  const xOffset = viewWidth / 2;
  const yOffset = viewHeight / 2;
  const depth = minDimension < 600 ? 1 : 2;
  const maxNodes = 300;

  return {
    viewHeight,
    viewWidth,
    minDimension,
    xOffset,
    yOffset,
    maxNodes,
    leftBoundary: -viewWidth / 2 + boundarySize,
    rightBoundary: viewWidth / 2 - boundarySize,
    topBoundary: -yOffset + boundarySize,
    bottomBoundary: viewHeight - yOffset - boundarySize,
    xOffsetText: -35,
    yOffsetText: -10,
    heightText: 60,
    widthText: 1500,
    linkForceFactor: 1.2,
    chargeForceFactor: 1.2,
    centerForceFactor: Math.min(0.25 * (1100.0 / minDimension) ** 2, 0.3),
    boundarySize,
    depth,
    getRadius: (d: GraphNode) => {
      return d.depth === 0
        ? DEPTH_1_RADIUS
        : d.depth === 1
          ? 15
          : d.depth === 2
            ? 5
            : 2;
    },

    // How much node repels
    getCharge: (factor: number) => (d: Node | SimulationNodeDatum) => {
      return -8000 * factor;
    },

    linkTypeForceWeight,
    linkDepthForceWeight,

    // How much each link attracts
    getLinkForce: (factor: number) => (d: GraphLink) =>
      factor * linkTypeForceWeight() * linkDepthForceWeight(),
  };
};

export default defaultConfiguration;
