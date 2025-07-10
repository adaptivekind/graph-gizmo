import { GraphConfiguration, EnrichedNodeDatum } from "./types";
const DEPTH_1_RADIUS = 30;
const boundarySize = DEPTH_1_RADIUS * 4;

const linkTypeForceWeight = () => {
  return 1;
};

const linkDepthForceWeight = () => 1;

const defaultConfiguration = (
  config: Partial<GraphConfiguration>,
): GraphConfiguration => {
  const viewHeight = config.viewHeight || 100;
  const viewWidth = config.viewWidth || 100;
  const minDimension = Math.min(viewWidth, viewHeight);
  const xOffset = viewWidth / 2;
  const yOffset = viewHeight / 2;
  const depth = minDimension < 600 ? 1 : 2;
  const maxNodes = 300;

  return {
    ...{
      alphaDecay: 0.03,
      bottomBoundary: viewHeight - yOffset - boundarySize,
      boundarySize,
      centerForceFactor:
        Math.round(100 * Math.min(0.25 * (1100.0 / minDimension) ** 2, 0.3)) /
        100,
      chargeForceFactor: 1.2,
      containerSelector: "#gizmo",
      depth,
      debug: false,
      configPanel: false,
      heightText: 60,
      leftBoundary: -viewWidth / 2 + boundarySize,
      linkForceFactor: 1.2,
      maxNodes,
      minDimension,
      rightBoundary: viewWidth / 2 - boundarySize,
      topBoundary: -yOffset + boundarySize,
      velocityDecay: 0.5,
      viewHeight,
      viewWidth,
      widthText: 1500,
      xOffset,
      xOffsetText: -35,
      yOffset,
      yOffsetText: -10,
      getRadius: (d: EnrichedNodeDatum) => {
        return d.depth === 0
          ? DEPTH_1_RADIUS
          : d.depth === 1
            ? 15
            : d.depth === 2
              ? 5
              : 2;
      },

      // How much node repels
      getCharge: (factor: number) => (d: EnrichedNodeDatum) => {
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
    ...config,
  };
};

export default defaultConfiguration;
