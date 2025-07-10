import { Node } from "@adaptivekind/graph-schema";
import { SimulationLinkDatum, SimulationNodeDatum } from "d3-force";

export type GraphSimulation = d3.Simulation<EnrichedNodeDatum, undefined>;

export interface EnrichedNode extends Node {
  id: string;
  context?: string;
  depth: number;
  showLabel: boolean;
  wanted: boolean;
}

export interface EnrichedNodeDatum extends SimulationNodeDatum, EnrichedNode {}

export interface EnrichedLink {
  depth: number;
}

export interface EnrichedLinkDatum
  extends SimulationLinkDatum<EnrichedNodeDatum>,
    EnrichedLink {}

export interface EnrichedGraph {
  nodes: EnrichedNodeDatum[];
  links: EnrichedLinkDatum[];
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
  alphaDecay: number;
  bottomBoundary: number;
  boundarySize: number;
  centerForceFactor: number;
  chargeForceFactor: number;
  configPanel: boolean;
  containerSelector: string;
  debug: boolean;
  depth: number;
  dynamicLoad: boolean;
  getCharge: (factor: number) => (d: EnrichedNodeDatum) => number;
  getLinkForce: (factor: number) => (d: EnrichedLink) => number;
  getRadius: (d: EnrichedNodeDatum) => number;
  heightText: number;
  leftBoundary: number;
  linkDepthForceWeight: (link: EnrichedLink) => number;
  linkForceFactor: number;
  linkTypeForceWeight: () => number;
  maxNodes: number;
  minDimension: number;
  rootNode?: string;
  rightBoundary: number;
  topBoundary: number;
  velocityDecay: number;
  viewHeight: number;
  viewWidth: number;
  widthText: number;
  xOffset: number;
  xOffsetText: number;
  yOffset: number;
  yOffsetText: number;
  loadShoelace: boolean;
  loadAlpine: boolean;
}

export type Canvas = d3.Selection<
  d3.BaseType,
  null,
  HTMLElement | null,
  undefined
>;
