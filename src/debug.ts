import { GraphConfiguration } from "./types";

export const renderDebugPanel = (
  document: Document,
  containerSelector: string,
  config: GraphConfiguration,
) => {
  const div = document.createElement("div");
  div.style.zIndex = "9999;";
  div.style.position = "absolute";
  div.style.left = "0";
  div.style.top = "0";
  div.style.backgroundColor = "#bbb";
  div.style.width = "500px";
  const text = document.createTextNode(
    `width : ${config.viewWidth} ; height: ${config.viewHeight} ; link force factor = ${config.linkForceFactor}`,
  );
  div.appendChild(text);
  document.querySelector(containerSelector)?.appendChild(div);
};
