import { builder } from "@adaptivekind/graph-schema";
import { findByRole, findByText } from "@testing-library/dom";
import * as d3 from "d3";
import { BaseType } from "d3";

import render from "./render";

describe("render graph", () => {
  it("should render OK", async () => {
    const graph = builder().id("foo").to("bar").id("bar").build();

    const container = document.createElement("div");
    render(
      graph,
      { debug: true, configPanel: true, dynamicLoad: false },
      container,
    );

    expect(await findByRole(container, "dialog")).toBeDefined();
    expect(
      await findByText(container, /centerForceFactor = 0.3/),
    ).toBeDefined();
  });
});
