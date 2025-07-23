import * as d3 from "d3";
import { SimulationLinkDatum, SimulationNodeDatum } from "d3-force";
import { Node } from "@adaptivekind/graph-schema";

export type GraphSimulation = d3.Simulation<EnrichedNodeDatum, undefined>;

export interface EnrichedNode extends Node {
  context?: string;
  depth: number;
  id: string;
  showLabel: boolean;
  wanted: boolean;
  value: number;
}

export interface EnrichedNodeDatum extends SimulationNodeDatum, EnrichedNode {}

export interface EnrichedLink {
  depth: number;
  value: number;
}

export interface EnrichedLinkDatum
  extends SimulationLinkDatum<EnrichedNodeDatum>,
    EnrichedLink {}

export interface EnrichedGraph {
  nodes: EnrichedNodeDatum[];
  links: EnrichedLinkDatum[];
}

export interface InitialNodeValue {
  fx?: number;
  fy?: number;
  vx?: number;
  vy?: number;
  x?: number;
  y?: number;
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
  loadAlpine: boolean;
  loadShoelace: boolean;
  maxNodes: number;
  minDimension: number;
  rightBoundary: number;
  rootNode?: string;
  searchDepth: number;
  searchQuery: string;
  topBoundary: number;
  velocityDecay: number;
  viewHeight: number;
  viewWidth: number;
  widthText: number;
  xOffset: number;
  xOffsetText: number;
  yOffset: number;
  yOffsetText: number;
}

export type Canvas = d3.Selection<
  d3.ContainerElement,
  null,
  HTMLElement | null,
  undefined
>;
