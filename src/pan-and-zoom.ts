import * as d3 from "d3";
import { Canvas } from "./types";

export const withPanAndZoom = (container: Canvas): Canvas => {
  let transform = d3.zoomIdentity;

  const canvas: Canvas = container
    .append<d3.ContainerElement>("g")
    .classed("canvas", true);
  const zoom = d3
    .zoom<d3.ContainerElement, null>()
    .scaleExtent([0.1, 4])
    .on("zoom", (event) => {
      transform = event.transform;
      canvas.attr("transform", transform.toString());
    });

  container.call(zoom);
  return canvas;
};
