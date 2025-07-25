import { findByRole, findByText } from "@testing-library/dom";
import { DEFAULT_CENTER_FORCE_FACTOR } from "../src/default-configuration";
import { builder } from "@adaptivekind/graph-schema";
import render from "../src/render";

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
      await findByText(
        container,
        new RegExp(`centerForceFactor = ${DEFAULT_CENTER_FORCE_FACTOR}`),
      ),
    ).toBeDefined();
  });
});
