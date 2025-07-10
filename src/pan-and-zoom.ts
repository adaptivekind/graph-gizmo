import * as d3 from "d3";
import { Canvas } from "./types";

export const withPanAndZoom = (container: Canvas): Canvas => {
  let transform = d3.zoomIdentity;

  const canvas = container.append("g").classed("canvas", true);
  const zoom = d3
    .zoom()
    .scaleExtent([0.1, 4])
    .on("zoom", (event) => {
      transform = event.transform;
      canvas.attr("transform", transform.toString());
    });

  (container as any).call(zoom);
  return canvas as any;
};
