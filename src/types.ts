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
  viewWidth: number;
  viewHeight: number;
  minDimension: number;
  xOffset: number;
  yOffset: number;
  boundarySize: number;
  leftBoundary: number;
  rightBoundary: number;
  topBoundary: number;
  bottomBoundary: number;
  xOffsetText: number;
  yOffsetText: number;
  heightText: number;
  widthText: number;
  linkForceFactor: number;
  chargeForceFactor: number;
  centerForceFactor: number;
  maxNodes: number;

  depth: number;
  getRadius: (d: GraphNodeDatum) => number;
  getCharge: (factor: number) => (d: GraphNodeDatum) => number;
  linkTypeForceWeight: () => number;
  linkDepthForceWeight: (link: GraphLink) => number;
  getLinkForce: (factor: number) => (d: GraphLink) => number;
}

export type GraphSelect = d3.Selection<
  d3.BaseType,
  null,
  HTMLElement | null,
  undefined
>;
