import { SimulationLinkDatum, SimulationNodeDatum } from "d3-force";

export type GardenSimulation = d3.Simulation<GraphNodeDatum, undefined>;

export interface GraphNode {
  id: string;
  label: string;
  context?: string;
  depth: number;
  showLabel: boolean;
  wanted: boolean;
}

export interface GraphNodeDatum extends SimulationNodeDatum, GraphNode {}

export interface GraphLink {}

export interface GraphLinkDatum
  extends SimulationLinkDatum<GraphNodeDatum>,
    GraphLink {}

export interface PresentationGraph {
  nodes: GraphNodeDatum[];
  links: GraphLinkDatum[];
}

export interface InitialNodeValue {
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number;
  fy?: number;
}

export type InitialNodeValueMap = { [key: string]: InitialNodeValue };

export interface GraphConfiguration {
  bottomBoundary: number;
  boundarySize: number;
  centerForceFactor: number;
  chargeForceFactor: number;
  container: string;
  debug: boolean;
  depth: number;
  getCharge: (factor: number) => (d: GraphNodeDatum) => number;
  getLinkForce: (factor: number) => (d: GraphLink) => number;
  getRadius: (d: GraphNodeDatum) => number;
  heightText: number;
  leftBoundary: number;
  linkDepthForceWeight: (link: GraphLink) => number;
  linkForceFactor: number;
  linkTypeForceWeight: () => number;
  maxNodes: number;
  minDimension: number;
  rightBoundary: number;
  topBoundary: number;
  viewHeight: number;
  viewWidth: number;
  widthText: number;
  xOffset: number;
  xOffsetText: number;
  yOffset: number;
  yOffsetText: number;
}

export type GraphSelect = d3.Selection<
  d3.BaseType,
  null,
  HTMLElement | null,
  undefined
>;

export type DefaultConfigurationParameters = {
  container?: string;
  debug: boolean;
  start?: string;
  viewHeight: number;
  viewWidth: number;
};
