import { GraphConfiguration } from "./types";

const appendConfigValue = (
  div: HTMLElement,
  config: GraphConfiguration,
  name: keyof GraphConfiguration,
) => {
  const text = document.createTextNode(`${name} = ${config[name]} ; `);
  div.appendChild(text);
};

export const renderDebugPanel = (
  document: Document,
  container: Element,
  config: GraphConfiguration,
) => {
  const div = document.createElement("div");
  div.style.zIndex = "9999;";
  div.style.position = "absolute";
  div.style.left = "0";
  div.style.top = "0";
  div.style.backgroundColor = "#bbb";
  div.style.width = "500px";
  [
    "viewWidth",
    "viewHeight",
    "linkForceFactor",
    "chargeForceFactor",
    "centerForceFactor",
  ].forEach((name) =>
    appendConfigValue(div, config, name as keyof GraphConfiguration),
  );

  container.appendChild(div);
};
