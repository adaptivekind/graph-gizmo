import { EnrichedLink, EnrichedNodeDatum, GraphConfiguration } from "./types";
const DEPTH_1_RADIUS = 60;
const boundarySize = DEPTH_1_RADIUS * 4;

const linkTypeForceWeight = () => {
  return 1;
};

const linkDepthForceWeight = (link: EnrichedLink) =>
  link.depth === 0
    ? 1.0 * link.value
    : link.depth === 1
      ? 1.0 * link.value
      : link.depth === 2
        ? 0.15 * link.value
        : 0.08 * link.value;

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
      centerForceFactor: 0.8,
      chargeForceFactor: 2,
      configPanel: false,
      containerSelector: "#gizmo",
      debug: false,
      depth,
      dynamicLoad: !!config.configPanel,
      heightText: 20,
      leftBoundary: -viewWidth / 2 + boundarySize,
      linkForceFactor: 8,
      loadAlpine: !!config.configPanel,
      loadShoelace: !!config.configPanel,
      maxNodes,
      minDimension,
      rightBoundary: viewWidth / 2 - boundarySize,
      topBoundary: -yOffset + boundarySize,
      velocityDecay: 0.2,
      viewHeight,
      viewWidth,
      widthText: 1000,
      xOffset,
      xOffsetText: -35,
      yOffset,
      yOffsetText: -10,
      getRadius: (d: EnrichedNodeDatum) => {
        return d.depth === 0
          ? DEPTH_1_RADIUS * d.value
          : d.depth === 1
            ? 30 * d.value
            : d.depth === 2
              ? 5 * d.value
              : 2 * d.value;
      },

      // How much node repels
      getCharge: (factor: number) => (d: EnrichedNodeDatum) => {
        return d.depth === 0
          ? -8000 * factor * d.value
          : d.depth === 1
            ? -4000 * factor * d.value
            : d.depth === 2
              ? -50 * factor * d.value
              : -5 * factor * d.value;
      },

      linkTypeForceWeight,
      linkDepthForceWeight,

      // How much each link attracts
      getLinkForce: (factor: number) => (d: EnrichedLink) =>
        factor * linkTypeForceWeight() * linkDepthForceWeight(d),
    },
    ...config,
  };
};

export default defaultConfiguration;
