import { GraphConfiguration } from "./types";

export const renderDebugPanel = (
  document: Document,
  containerSelector: string,
  config: GraphConfiguration,
) => {
  const div = document.createElement("div");
  div.style.zIndex = "9999;";
  div.style.position = "fixed";
  div.style.right = "0;";
  div.style.top = "0;";
  div.style.backgroundColor = "#bbb";
  const text = document.createTextNode(
    `width : ${config.viewWidth} ; height: ${config.viewHeight}`,
  );
  div.appendChild(text);
  document.querySelector(containerSelector)?.appendChild(div);
};
