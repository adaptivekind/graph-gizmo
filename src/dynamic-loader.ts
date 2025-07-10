export interface LibraryConfig {
  name: string;
  css?: string;
  js?: string;
  module?: boolean;
  defer?: boolean;
}

const loadedLibraries = new Set<string>();

const loadCSS = (href: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.onload = () => resolve();
    link.onerror = () => reject(new Error(`Failed to load CSS: ${href}`));
    document.head.appendChild(link);
  });
};

const loadJS = (
  src: string,
  isModule = false,
  defer = false,
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    if (isModule) script.type = "module";
    if (defer) script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load JS: ${src}`));
    document.head.appendChild(script);
  });
};

export const loadLibrary = async (config: LibraryConfig): Promise<void> => {
  if (loadedLibraries.has(config.name)) {
    return;
  }

  const promises: Promise<void>[] = [];

  if (config.css) {
    promises.push(loadCSS(config.css));
  }

  if (config.js) {
    promises.push(loadJS(config.js, config.module, config.defer));
  }

  await Promise.all(promises);
  loadedLibraries.add(config.name);
};

export const loadShoelaceAndAlpine = async (): Promise<void> => {
  await Promise.all([
    loadLibrary({
      name: "shoelace",
      css: "https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.17.1/cdn/themes/light.css",
      js: "https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.17.1/cdn/shoelace.js",
      module: true,
    }),
    loadLibrary({
      name: "alpine",
      js: "https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js",
      defer: true,
    }),
  ]);
};
