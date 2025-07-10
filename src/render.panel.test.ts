import { builder } from "@adaptivekind/graph-schema";
import { findByRole } from "@testing-library/dom";
import * as d3 from "d3";
import { BaseType } from "d3";

import render from "./render";

describe("render graph", () => {
  it("should render OK", async () => {
    const graph = builder().id("foo").to("bar").id("bar").build();

    const container = document.createElement("div");
    render(graph, { configPanel: true, dynamicLoad: false }, container);

    const panelElement = await findByRole(container, "dialog");
    expect(panelElement).toBeDefined();
  });
});
