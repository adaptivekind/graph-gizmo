import * as d3 from "d3";

import collideRectangle from "./collide-rectangle";
import { createEnrichedGraph } from "./presentation-graph";
import {
  GraphSimulation,
  EnrichedGraph,
  GraphConfiguration,
  EnrichedLinkDatum,
  EnrichedNodeDatum,
  Container,
  InitialNodeValueMap,
} from "./types";
import { builder, Graph } from "@adaptivekind/graph-schema";
import { renderDebugPanel } from "./debug";
import defaultConfiguration from "./default-configuration";
import { withPanAndZoom } from "./pan-and-zoom";
import { addConfigPanelStyles, createConfigPanel } from "./config-panel";
import { createUpdateConfig } from "./update-config";

const onNodeMouseOver = (_: MouseEvent, current: EnrichedNodeDatum) => {
  d3.selectAll<SVGAElement, EnrichedNodeDatum>(".group")
    .filter((d: EnrichedNodeDatum) => d.id === current.id)
    .classed("active", true);
  d3.selectAll<SVGAElement, EnrichedLinkDatum>("line")
    .filter(
      (d: EnrichedLinkDatum) =>
        (d.target as EnrichedNodeDatum).id === current.id ||
        (d.source as EnrichedNodeDatum).id === current.id,
    )
    .classed("active", true);
};

const onNodeMouseLeave = (_: MouseEvent, current: EnrichedNodeDatum) => {
  d3.selectAll<SVGAElement, EnrichedNodeDatum>(".group")
    .filter((d: EnrichedNodeDatum) => d.id === current.id)
    .classed("active", false);
  d3.selectAll<SVGAElement, EnrichedLinkDatum>("line")
    .filter(
      (d: EnrichedLinkDatum) =>
        (d.target as EnrichedNodeDatum).id === current.id ||
        (d.source as EnrichedNodeDatum).id === current.id,
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
  container: Container,
  simulation: GraphSimulation,
  start: string,
  graph: Graph,
  updateEvent: (
    this: HTMLAnchorElement,
    event: MouseEvent,
    d: EnrichedNodeDatum,
  ) => void,
) => {
  const nodes = container.selectAll<SVGElement, EnrichedNodeDatum>(".group");

  const initialValues: InitialNodeValueMap = {};
  nodes.data().forEach((node: EnrichedNodeDatum) => {
    initialValues[node.id] = {
      x: safeInitialValue(node.x),
      y: safeInitialValue(node.y),
      fx: safeInitialValue(node.fx),
      fy: safeInitialValue(node.fy),
    };
  });

  const enrichedGraph = createEnrichedGraph(start, graph, initialValues);

  function click(
    this: SVGElement,
    _: { currentTarget: never },
    d: EnrichedNodeDatum,
  ): void {
    delete d.fx;
    delete d.fy;
    d3.select(this.parentElement).classed("fixed", false);
    simulation.alpha(0.3).restart();
  }

  container
    .selectAll<SVGLineElement, EnrichedLinkDatum>(".link")
    .data(
      enrichedGraph.links,
      (d: EnrichedLinkDatum) => `${d.source}|${d.target}`,
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

  nodes
    .data(enrichedGraph.nodes, (d: EnrichedNodeDatum) => d.id)
    .join(
      (entry) => {
        const group = entry
          .append("g")
          .attr("class", function (d: EnrichedNodeDatum) {
            return `node depth-${d.depth}`;
          })
          .classed("group", true)
          .classed("wanted", (d: EnrichedNodeDatum) => d.wanted)
          .classed("fixed", (d: EnrichedNodeDatum) => d.fx !== undefined)
          .classed("hideLabel", (d: EnrichedNodeDatum) => !d.showLabel)
          .attr("transform", `translate(${config.xOffset},${config.yOffset})`)
          .raise();

        group
          .append("circle")
          .on("mouseover", onNodeMouseOver)
          .on("mouseleave", onNodeMouseLeave)
          .on("click", click)
          .attr("r", config.getRadius)
          .classed("point", true)
          .append("title")
          .text((d: EnrichedNodeDatum) => d.id);

        const anchor = group.append("a").on("click", updateEvent);

        anchor
          .append("text")
          .on("mouseover", onNodeMouseOver)
          .on("mouseleave", onNodeMouseLeave)
          .text((d: EnrichedNodeDatum) => d.label || d.id)
          .attr("x", config.xOffsetText)
          .attr("y", config.yOffsetText)
          .classed("label", true)
          .append("text");

        anchor
          .filter((d: EnrichedNodeDatum) => d.showLabel && !!d.context)
          .append("text")
          .attr("x", config.xOffsetText)
          .attr("y", () => config.yOffsetText)
          .text((d: EnrichedNodeDatum) => d.context || "n/a")
          .classed("context-label", true);

        return group;
      },
      (update) => {
        update
          .classed("hideLabel", (d: EnrichedNodeDatum) => !d.showLabel)
          .classed("fixed", (d: EnrichedNodeDatum) => d.fx !== undefined)
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

  return applySimulation(config, enrichedGraph, container, simulation);
};

const newTick =
  (container: Container, xOffset: number, yOffset: number) => () => {
    container
      .selectAll<SVGLineElement, EnrichedLinkDatum>(".link")
      .attr("x1", (d) => ((d?.source as EnrichedNodeDatum)?.x ?? 0) + xOffset)
      .attr("y1", (d) => ((d?.source as EnrichedNodeDatum)?.y ?? 0) + yOffset)
      .attr("x2", (d) => ((d?.target as EnrichedNodeDatum)?.x ?? 0) + xOffset)
      .attr("y2", (d) => ((d?.target as EnrichedNodeDatum)?.y ?? 0) + yOffset);
    container
      .selectAll<SVGElement, EnrichedNodeDatum>(".group")
      .attr(
        "transform",
        (d: EnrichedNodeDatum) =>
          "translate(" +
          (xOffset + (d?.x ?? 0)) +
          "," +
          (yOffset + (d?.y ?? 0)) +
          ")",
      );
  };

const createSimulation = (
  config: GraphConfiguration,
  container: Container,
): GraphSimulation => {
  const tick = newTick(container, config.xOffset, config.yOffset);
  return d3
    .forceSimulation<EnrichedNodeDatum>()
    .force(
      "charge",
      d3
        .forceManyBody<EnrichedNodeDatum>()
        .strength(config.getCharge(config.chargeForceFactor)),
    )
    .force(
      "collide",
      d3.forceCollide<EnrichedNodeDatum>().radius(config.getRadius),
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
    .alphaDecay(config.alphaDecay)
    .velocityDecay(config.velocityDecay)
    .on("tick", tick);
};

const applySimulation = (
  config: GraphConfiguration,
  graph: EnrichedGraph,
  container: Container,
  simulation: GraphSimulation,
) => {
  simulation.nodes(graph.nodes);
  simulation.force(
    "link",
    d3
      .forceLink<EnrichedNodeDatum, EnrichedLinkDatum>(graph.links)
      .id((d: EnrichedNodeDatum) => d.id)
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
    .drag<SVGElement, EnrichedNodeDatum, never>()
    .on("start", dragstart)
    .on("drag", dragged);

  container.selectAll<SVGElement, EnrichedNodeDatum>(".group").call(drag);
};

const render = (
  graph: Graph | number,
  config: Partial<GraphConfiguration> = {},
  providedContainer?: Container,
  callback: (name: string, event: MouseEvent) => void = () => {},
) => {
  // Add config panel styles
  addConfigPanelStyles();

  const width = window ? window.innerWidth : 100;
  const height = window ? window.innerHeight : 100;
  const fullConfig = defaultConfiguration({
    ...{ viewWidth: width, viewHeight: height, debug: false },
    ...config,
  });
  const containerSelector = fullConfig.containerSelector;
  if (fullConfig.debug) {
    renderDebugPanel(document, containerSelector, fullConfig);
  }

  const container: Container = withPanAndZoom(
    ((): Container => {
      if (providedContainer) {
        return providedContainer;
      }
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("width", String(width));
      svg.setAttribute("height", String(height));
      svg.classList.add("linkGraph");
      document.querySelector(containerSelector)?.appendChild(svg);
      const _containerSelection: Container = d3.select(
        `${containerSelector} svg.linkGraph`,
      );
      _containerSelection.attr("viewBox", `0 0 ${width} ${height}`);
      return _containerSelection;
    })(),
  );

  const actualGraph =
    typeof graph === "number" ? builder().many(graph).build() : graph;

  const simulation = createSimulation(fullConfig, container);

  function updateEvent(
    this: HTMLAnchorElement,
    event: MouseEvent,
    d: EnrichedNodeDatum,
  ): void {
    callback(d.id, event);
    update(fullConfig, container, simulation, d.id, actualGraph, updateEvent);
  }

  const updateConfig = createUpdateConfig(fullConfig, simulation);

  update(
    fullConfig,
    container,
    simulation,
    config.rootNode || Object.keys(actualGraph.nodes)[0],
    actualGraph,
    updateEvent,
  );

  // Create the configuration panel
  createConfigPanel({
    config: fullConfig,
    onConfigChange: (configUpdate) => {
      updateConfig(configUpdate);
    },
  }).catch(console.error);

  return simulation;
};

export default render;
