import { Graph } from "@adaptivekind/graph-schema";
import { findAllByText } from "@testing-library/dom";
import * as d3 from "d3";
import { BaseType } from "d3";

import defaultConfiguration from "./default-configuration";
import render from "./render";
import { GraphConfiguration } from "./types";

describe("render graph", () => {
  it("should render OK", async () => {
    const graph: Graph = {
      nodes: {
        foo: {
          label: "foo",
        },
        bar: {
          label: "bar",
        },
      },
      links: [{ source: "bar", target: "foo" }],
    };

    const graphConfiguration: GraphConfiguration = defaultConfiguration({
      viewWidth: 800,
      viewHeight: 800,
    });

    const container = document.createElement("svg");
    const svg = d3.select<d3.BaseType, null>(
      container.getRootNode() as BaseType,
    );

    render("foo", graph, graphConfiguration, svg);

    const fooNode = await findAllByText(container, "foo");
    expect(fooNode).toBeDefined();
    expect(fooNode).toHaveLength(2);

    const nodes = container.getElementsByTagName("circle");
    expect(nodes).toHaveLength(2);
    const links = container.getElementsByTagName("line");
    expect(links).toHaveLength(1);
  });
});
