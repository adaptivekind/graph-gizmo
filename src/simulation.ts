import * as d3 from "d3";
import {
  Canvas,
  DisplayGraph,
  EnrichedLinkDatum,
  EnrichedNodeDatum,
  GraphConfiguration,
  GraphSimulation,
} from "./types";
import collideRectangle from "./collide-rectangle";

function clamp(x: number, low: number, high: number) {
  return x < low ? low : x > high ? high : x;
}

const newTick = (canvas: Canvas, xOffset: number, yOffset: number) => () => {
  canvas
    .selectAll<SVGLineElement, EnrichedLinkDatum>(".link")
    .attr("x1", (d) => ((d?.source as EnrichedNodeDatum)?.x ?? 0) + xOffset)
    .attr("y1", (d) => ((d?.source as EnrichedNodeDatum)?.y ?? 0) + yOffset)
    .attr("x2", (d) => ((d?.target as EnrichedNodeDatum)?.x ?? 0) + xOffset)
    .attr("y2", (d) => ((d?.target as EnrichedNodeDatum)?.y ?? 0) + yOffset);
  canvas
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

export const createSimulation = (
  config: GraphConfiguration,
  canvas: Canvas,
): GraphSimulation => {
  const tick = newTick(canvas, config.xOffset, config.yOffset);
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
      collideRectangle([
        config.xOffsetText,
        config.yOffsetText,
        config.widthText,
        config.heightText,
      ]),
    )
    .force(
      "forceX",
      d3
        .forceX<EnrichedNodeDatum>(0)
        .strength((d) => d.value * config.centerForceFactor),
    )
    .force(
      "forceY",
      d3
        .forceY<EnrichedNodeDatum>(0)
        .strength((d: EnrichedNodeDatum) => d.value * config.centerForceFactor),
    )
    .alpha(1)
    .alphaMin(0.0002)
    .alphaDecay(config.alphaDecay)
    .velocityDecay(config.velocityDecay)
    .on("tick", tick);
};

export const applySimulation = (
  config: GraphConfiguration,
  graph: DisplayGraph,
  canvas: Canvas,
  simulation: GraphSimulation,
  firstTime: boolean,
) => {
  simulation.stop();
  simulation.nodes(graph.nodes);
  simulation.force(
    "link",
    d3
      .forceLink<EnrichedNodeDatum, EnrichedLinkDatum>(graph.links)
      .id((d: EnrichedNodeDatum) => d.id)
      .strength(config.getLinkForce(config.linkForceFactor)),
  );
  if (firstTime) {
    simulation.tick(100); // Step forward number of ticks in the simulation
  }
  simulation.alpha(0.2).restart();

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

  canvas.selectAll<SVGElement, EnrichedNodeDatum>(".group").call(drag);
};
