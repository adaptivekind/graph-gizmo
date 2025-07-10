import * as d3 from "d3";
import collideRectangle from "./collide-rectangle";
import {
  GraphSimulation,
  EnrichedGraph,
  GraphConfiguration,
  EnrichedLinkDatum,
  EnrichedNodeDatum,
  Container,
} from "./types";

function clamp(x: number, low: number, high: number) {
  return x < low ? low : x > high ? high : x;
}

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

export const createSimulation = (
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

export const applySimulation = (
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
