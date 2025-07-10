import { builder } from "@adaptivekind/graph-schema";
import { findAllByText } from "@testing-library/dom";
import * as d3 from "d3";
import { BaseType } from "d3";

import render from "./render";

describe("render graph", () => {
  it("should render OK", async () => {
    const graph = builder().id("foo").to("bar").id("bar").build();

    const container = document.createElement("div");
    render(graph, {}, container);

    const fooNode = await findAllByText(container, "foo");
    expect(fooNode).toBeDefined();
    expect(fooNode).toHaveLength(2);

    const nodes = container.getElementsByTagName("circle");
    expect(nodes).toHaveLength(2);
    const links = container.getElementsByTagName("line");
    expect(links).toHaveLength(1);
  });
});
