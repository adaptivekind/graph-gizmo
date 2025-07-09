import * as d3 from "d3";

import collideRectangle from "./collide-rectangle";
import { createPresentationGraph } from "./presentation-graph";
import {
  GardenSimulation,
  PresentationGraph,
  GraphConfiguration,
  GraphLinkDatum,
  GraphNodeDatum,
  GraphSelect,
  InitialNodeValueMap,
  DefaultConfigurationParameters,
} from "./types";
import { Graph } from "@adaptivekind/graph-schema";
import { renderDebugPanel } from "./debug";
import defaultConfiguration from "./default-configuration";

const onNodeMouseOver = (_: MouseEvent, current: GraphNodeDatum) => {
  d3.selectAll<SVGAElement, GraphNodeDatum>(".group")
    .filter((d: GraphNodeDatum) => d.id === current.id)
    .classed("active", true);
  d3.selectAll<SVGAElement, GraphLinkDatum>("line")
    .filter(
      (d: GraphLinkDatum) =>
        (d.target as GraphNodeDatum).id === current.id ||
        (d.source as GraphNodeDatum).id === current.id,
    )
    .classed("active", true);
};

const onNodeMouseLeave = (_: MouseEvent, current: GraphNodeDatum) => {
  d3.selectAll<SVGAElement, GraphNodeDatum>(".group")
    .filter((d: GraphNodeDatum) => d.id === current.id)
    .classed("active", false);
  d3.selectAll<SVGAElement, GraphLinkDatum>("line")
    .filter(
      (d: GraphLinkDatum) =>
        (d.target as GraphNodeDatum).id === current.id ||
        (d.source as GraphNodeDatum).id === current.id,
    )
    .classed("active", false);
};

function clamp(x: number, low: number, high: number) {
  return x < low ? low : x > high ? high : x;
}

const safeInitialValue = (x: number | null | undefined) => {
  if (!x || Math.abs(x) < 0.1) {
    return undefined;
  }
  return x;
};

const update = (
  config: GraphConfiguration,
  svg: GraphSelect,
  simulation: GardenSimulation,
  start: string,
  graph: Graph,
  updateEvent: (
    this: HTMLAnchorElement,
    event: MouseEvent,
    d: GraphNodeDatum,
  ) => void,
) => {
  const selectGroup = svg.selectAll<SVGElement, GraphNodeDatum>(".group");

  const initialValues: InitialNodeValueMap = {};
  selectGroup.data().forEach((node: GraphNodeDatum) => {
    initialValues[node.id] = {
      x: safeInitialValue(node.x),
      y: safeInitialValue(node.y),
      fx: safeInitialValue(node.fx),
      fy: safeInitialValue(node.fy),
    };
  });

  const presentationGraph = createPresentationGraph(
    start,
    graph,
    initialValues,
  );

  function click(
    this: SVGElement,
    _: { currentTarget: never },
    d: GraphNodeDatum,
  ): void {
    delete d.fx;
    delete d.fy;
    d3.select(this.parentElement).classed("fixed", false);
    simulation.alpha(0.3).restart();
  }

  svg
    .selectAll<SVGLineElement, GraphLinkDatum>(".link")
    .data(
      presentationGraph.links,
      (d: GraphLinkDatum) => `${d.source}|${d.target}`,
    )
    .join(
      (entry) =>
        entry
          .append("line")
          .attr("class", () => `link`)
          .attr("x1", config.xOffset)
          .attr("x2", config.xOffset)
          .attr("y1", config.yOffset)
          .attr("y2", config.yOffset)
          .lower(),
      (update) => update.attr("class", () => `link`).lower(),
      (exit) => exit.remove(),
    );

  selectGroup
    .data(presentationGraph.nodes, (d: GraphNodeDatum) => d.id)
    .join(
      (entry) => {
        const group = entry
          .append("g")
          .attr("class", function (d: GraphNodeDatum) {
            return `node depth-${d.depth}`;
          })
          .classed("group", true)
          .classed("wanted", (d: GraphNodeDatum) => d.wanted)
          .classed("fixed", (d: GraphNodeDatum) => d.fx !== undefined)
          .classed("hideLabel", (d: GraphNodeDatum) => !d.showLabel)
          .attr("transform", `translate(${config.xOffset},${config.yOffset})`)
          .raise();

        group
          .append("circle")
          .on("mouseover", onNodeMouseOver)
          .on("mouseleave", onNodeMouseLeave)
          .on("click", click)
          .attr("r", config.getRadius)
          .classed("node", true)
          .append("title")
          .text((d: GraphNodeDatum) => d.id);

        const anchor = group.append("a").on("click", updateEvent);

        anchor
          .append("text")
          .on("mouseover", onNodeMouseOver)
          .on("mouseleave", onNodeMouseLeave)
          .text((d: GraphNodeDatum) => d.label)
          .attr("x", config.xOffsetText)
          .attr("y", config.yOffsetText)
          .classed("label", true)
          .append("text");

        anchor
          .filter((d: GraphNodeDatum) => d.showLabel && !!d.context)
          .append("text")
          .attr("x", config.xOffsetText)
          .attr("y", () => config.yOffsetText)
          .text((d: GraphNodeDatum) => d.context || "n/a")
          .classed("context-label", true);

        return group;
      },
      (update) => {
        update
          .classed("hideLabel", (d: GraphNodeDatum) => !d.showLabel)
          .classed("fixed", (d: GraphNodeDatum) => d.fx !== undefined)
          .select("circle")
          .attr("r", config.getRadius);
        return update;
      },
      function (exit) {
        exit.selectChildren().remove();
        exit.remove();
        return exit;
      },
    );

  svg.selectAll<SVGElement, GraphNodeDatum>(".group");

  return applySimulation(config, presentationGraph, svg, simulation);
};

const newTick = (svg: GraphSelect, xOffset: number, yOffset: number) => () => {
  svg
    .selectAll<SVGLineElement, GraphLinkDatum>(".link")
    .attr("x1", (d) => ((d?.source as GraphNodeDatum)?.x ?? 0) + xOffset)
    .attr("y1", (d) => ((d?.source as GraphNodeDatum)?.y ?? 0) + yOffset)
    .attr("x2", (d) => ((d?.target as GraphNodeDatum)?.x ?? 0) + xOffset)
    .attr("y2", (d) => ((d?.target as GraphNodeDatum)?.y ?? 0) + yOffset);
  svg
    .selectAll<SVGElement, GraphNodeDatum>(".group")
    .attr(
      "transform",
      (d: GraphNodeDatum) =>
        "translate(" +
        (xOffset + (d?.x ?? 0)) +
        "," +
        (yOffset + (d?.y ?? 0)) +
        ")",
    );
};

const createSimulation = (
  config: GraphConfiguration,
  svg: GraphSelect,
): GardenSimulation => {
  const tick = newTick(svg, config.xOffset, config.yOffset);
  return d3
    .forceSimulation<GraphNodeDatum>()
    .force(
      "charge",
      d3
        .forceManyBody<GraphNodeDatum>()
        .strength(config.getCharge(config.chargeForceFactor)),
    )
    .force(
      "collide",
      d3.forceCollide<GraphNodeDatum>().radius(config.getRadius),
    )
    .force(
      "collideRectangle",
      collideRectangle(
        [
          config.xOffsetText,
          config.yOffsetText,
          config.widthText,
          config.heightText,
        ],
        2,
      ),
    )
    .force("forceX", d3.forceX(0).strength(config.centerForceFactor))
    .force("forceY", d3.forceY(0).strength(config.centerForceFactor))
    .tick(100) // Step forward 100 ticks in the simulation
    .alpha(1)
    .alphaMin(0.0002)
    .alphaDecay(0.03)
    .velocityDecay(0.5)
    .on("tick", tick);
};

const applySimulation = (
  config: GraphConfiguration,
  graph: PresentationGraph,
  svg: GraphSelect,
  simulation: GardenSimulation,
) => {
  simulation.nodes(graph.nodes);
  simulation.force(
    "link",
    d3
      .forceLink<GraphNodeDatum, GraphLinkDatum>(graph.links)
      .id((d: GraphNodeDatum) => d.id)
      .strength(config.getLinkForce(config.linkForceFactor)),
  );

  function dragstart(this: SVGElement) {
    d3.select(this).classed("fixed", true);
  }

  function dragged(
    this: SVGElement,
    event: { subject: { fx: number; fy: number }; x: number; y: number },
  ) {
    event.subject.fx = clamp(
      event.x,
      config.leftBoundary,
      config.rightBoundary,
    );
    event.subject.fy = clamp(
      event.y,
      config.topBoundary,
      config.bottomBoundary,
    );
    simulation.alpha(0.3).restart();
  }

  const drag = d3
    .drag<SVGElement, GraphNodeDatum, never>()
    .on("start", dragstart)
    .on("drag", dragged);

  svg.selectAll<SVGElement, GraphNodeDatum>(".group").call(drag);
};

const render = (
  graph: Graph,
  config: Partial<DefaultConfigurationParameters>,
  containerSelector: string,
  providedGraphElement?: GraphSelect,
  callback: (name: string, event: MouseEvent) => void = () => {},
) => {
  const width = window ? window.innerWidth : 100;
  const height = window ? window.innerHeight : 100;
  const fullConfig = defaultConfiguration({
    ...{ viewWidth: width, viewHeight: height, debug: false },
    ...config,
  });
  if (fullConfig.debug) {
    renderDebugPanel(document, containerSelector, fullConfig);
  }

  const graphElement: GraphSelect = ((): GraphSelect => {
    if (providedGraphElement) {
      return providedGraphElement;
    }
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", String(width));
    svg.setAttribute("height", String(height));
    svg.classList.add("linkGraph");
    document.querySelector(containerSelector)?.appendChild(svg);
    const _graphElement: GraphSelect = d3.select(
      `${containerSelector} svg.linkGraph`,
    );
    _graphElement.attr("viewBox", `0 0 ${width} ${height}`);
    return _graphElement;
  })();

  const simulation = createSimulation(fullConfig, graphElement);
  function updateEvent(
    this: HTMLAnchorElement,
    event: MouseEvent,
    d: GraphNodeDatum,
  ): void {
    callback(d.id, event);
    update(fullConfig, graphElement, simulation, d.id, graph, updateEvent);
  }

  update(
    fullConfig,
    graphElement,
    simulation,
    config.start || Object.keys(graph.nodes)[0],
    graph,
    updateEvent,
  );
  return simulation;
};

export default render;
