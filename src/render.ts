import * as d3 from "d3";

import {
  Canvas,
  EnrichedLinkDatum,
  EnrichedNodeDatum,
  GraphConfiguration,
  GraphSimulation,
  InitialNodeValueMap,
} from "./types";
import { Graph, builder } from "@adaptivekind/graph-schema";
import { addConfigPanelStyles, createConfigPanel } from "./config-panel";
import { addSearchPanelStyles, createSearchPanel } from "./search-panel";
import { applySimulation, createSimulation } from "./simulation";

import { createDisplayGraph } from "./display-graph";
import { createUpdateConfig } from "./update-config";
import defaultConfiguration from "./default-configuration";
import { renderDebugPanel } from "./debug";
import { withPanAndZoom } from "./pan-and-zoom";

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

const safeInitialValue = (x: number | null | undefined) => {
  if (!x || Math.abs(x) < 0.1) {
    return undefined;
  }
  return x;
};

const update = (
  config: GraphConfiguration,
  container: Canvas,
  simulation: GraphSimulation,
  start: string,
  graph: Graph,
  updateEvent: (
    this: HTMLAnchorElement,
    event: MouseEvent,
    d: EnrichedNodeDatum,
  ) => void,
  firstTime = false,
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

  const enrichedGraph = createDisplayGraph(start, graph, initialValues, config);

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
          .attr("class", "link")
          .attr("stroke-width", (d: EnrichedLinkDatum) => d.value * 4)
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

  return applySimulation(
    config,
    enrichedGraph,
    container,
    simulation,
    firstTime,
  );
};

const render = (
  graph: Graph | number,
  config: Partial<GraphConfiguration> = {},
  providedContainer?: Element,
  callback: (name: string, event: MouseEvent) => void = () => {},
) => {
  // Add panel styles
  addConfigPanelStyles();
  addSearchPanelStyles();

  const width = window ? window.innerWidth : 100;
  const height = window ? window.innerHeight : 100;
  const fullConfig = defaultConfiguration({
    ...{ viewWidth: width, viewHeight: height, debug: false },
    ...config,
  });
  const containerSelector = fullConfig.containerSelector;

  const container: Element = (() => {
    if (providedContainer) {
      return providedContainer;
    }
    const container = document.querySelector(containerSelector);
    if (!container) {
      throw Error(`Cannot find container ${containerSelector}`);
    }
    return container;
  })();

  if (fullConfig.debug) {
    renderDebugPanel(document, container, fullConfig);
  }

  const canvas: Canvas = withPanAndZoom(
    ((): Canvas => {
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("width", String(width));
      svg.setAttribute("height", String(height));
      container.appendChild(svg);
      const _containerSelection = d3.select<d3.ContainerElement, null>(svg);
      _containerSelection.attr("viewBox", `0 0 ${width} ${height}`);
      return _containerSelection;
    })(),
  );

  const actualGraph =
    typeof graph === "number" ? builder().many(graph).build() : graph;

  const simulation = createSimulation(fullConfig, canvas);

  let currentRoot = config.rootNode || Object.keys(actualGraph.nodes)[0];

  function updateEvent(
    this: HTMLAnchorElement,
    event: MouseEvent,
    d: EnrichedNodeDatum,
  ): void {
    callback(d.id, event);
    currentRoot = d.id;
    update(
      fullConfig,
      canvas,
      simulation,
      d.id,
      actualGraph,
      updateEvent,
      false,
    );
  }

  function updateWithSearch(searchQuery: string): void {
    fullConfig.searchQuery = searchQuery;

    // Determine if there should be a root change based on search
    const presentationGraph = createDisplayGraph(
      currentRoot,
      actualGraph,
      {},
      fullConfig,
    );

    // If a root is suggested and it exists in the graph, change to it
    let rootChanged = false;
    if (
      presentationGraph.rootId &&
      actualGraph.nodes[presentationGraph.rootId]
    ) {
      const previousRoot = currentRoot;
      currentRoot = presentationGraph.rootId;
      rootChanged = currentRoot !== previousRoot;
    }

    update(
      fullConfig,
      canvas,
      simulation,
      currentRoot,
      actualGraph,
      updateEvent,
      false,
    );

    // If pinRootNode is enabled and root changed from search, pin the new root
    if (fullConfig.pinRootNode && rootChanged) {
      setTimeout(() => {
        pinRootNodeToCenter();
      }, 0);
    }
  }

  const updateConfig = createUpdateConfig(fullConfig, simulation, () =>
    updateWithSearch(fullConfig.searchQuery),
  );

  function pinRootNodeToCenter(): void {
    const nodes = canvas.selectAll<SVGElement, EnrichedNodeDatum>(".group");

    // Pin the current root node to center
    nodes.data().forEach((node: EnrichedNodeDatum) => {
      if (node.id === currentRoot) {
        node.fx = 0;
        node.fy = 0;
      } else {
        // Unpin other nodes
        delete node.fx;
        delete node.fy;
      }
    });

    // Update visual state and restart simulation
    nodes.classed("fixed", (d: EnrichedNodeDatum) => d.fx !== undefined);

    simulation.alpha(0.3).restart();
  }

  update(
    fullConfig,
    canvas,
    simulation,
    currentRoot,
    actualGraph,
    updateEvent,
    true,
  );

  // Create the configuration panel
  createConfigPanel({
    config: fullConfig,
    container,
    graph: actualGraph,
    onConfigChange: (configUpdate) => {
      updateConfig(configUpdate);
    },
    onPinRootNode: pinRootNodeToCenter,
  });

  // Create the search panel
  createSearchPanel({
    config: fullConfig,
    container,
    graph: actualGraph,
    onSearchChange: updateWithSearch,
  });

  return simulation;
};

export default render;
