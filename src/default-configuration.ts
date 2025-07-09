import {
  DefaultConfigurationParameters,
  GraphConfiguration,
  GraphNodeDatum,
} from "./types";
const DEPTH_1_RADIUS = 30;
const boundarySize = DEPTH_1_RADIUS * 4;

const linkTypeForceWeight = () => {
  return 1;
};

const linkDepthForceWeight = () => 1;

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
    ...{
      bottomBoundary: viewHeight - yOffset - boundarySize,
      boundarySize,
      centerForceFactor: Math.min(0.25 * (1100.0 / minDimension) ** 2, 0.3),
      chargeForceFactor: 1.2,
      container: "#gizmo",
      depth,
      heightText: 60,
      leftBoundary: -viewWidth / 2 + boundarySize,
      linkForceFactor: 1.2,
      maxNodes,
      minDimension,
      rightBoundary: viewWidth / 2 - boundarySize,
      topBoundary: -yOffset + boundarySize,
      widthText: 1500,
      xOffset,
      xOffsetText: -35,
      yOffset,
      yOffsetText: -10,
      getRadius: (d: GraphNodeDatum) => {
        return d.depth === 0
          ? DEPTH_1_RADIUS
          : d.depth === 1
            ? 15
            : d.depth === 2
              ? 5
              : 2;
      },

      // How much node repels
      getCharge: (factor: number) => (d: GraphNodeDatum) => {
        return d.depth === 0
          ? -8000 * factor
          : d.depth === 1
            ? -4000 * factor
            : d.depth === 2
              ? -50 * factor
              : -5 * factor;
      },

      linkTypeForceWeight,
      linkDepthForceWeight,

      // How much each link attracts
      getLinkForce: (factor: number) => () =>
        factor * linkTypeForceWeight() * linkDepthForceWeight(),
    },
    ...parameters,
  };
};

export default defaultConfiguration;
