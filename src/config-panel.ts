import { Graph } from "@adaptivekind/graph-schema";
import { GraphConfiguration } from "./types";
import { loadShoelaceAndAlpine } from "./dynamic-loader";

declare global {
  interface Window {
    configPanel: () => {
      linkForceFactor: number;
      chargeForceFactor: number;
      centerForceFactor: number;
      alphaDecay: number;
      velocityDecay: number;
      searchDepth: number;
      pinRootNode: boolean;
      isExpanded: boolean;
    };
  }
}

export interface ConfigPanelOptions {
  config: GraphConfiguration;
  container: Element;
  graph: Graph;
  onConfigChange: (config: Partial<GraphConfiguration>) => void;
  onPinRootNode?: () => void;
}

export const createConfigPanel = async (
  options: ConfigPanelOptions,
): Promise<void> => {
  const { config, container, onConfigChange, onPinRootNode } = options;

  if (!config.configPanel) {
    return;
  }
  // Load Shoelace and Alpine.js dynamically
  if (config.dynamicLoad && (config.loadAlpine || config.loadShoelace)) {
    await loadShoelaceAndAlpine();
  }

  const div = document.createElement("div");
  div.role = "dialog";
  div.classList.add("config-panel");
  div.style.zIndex = "9999;";

  div.style.position = "absolute";
  div.style.right = "0";
  div.style.top = "0";
  div.style.backgroundColor = "#bbb";
  div.style.width = "500px";

  div.innerHTML = `
    <div class="config-panel" x-data="configPanel()">
      <div class="config-panel-header">
        <h3>Graph Configuration</h3>
        <sl-button
          variant="text"
          size="small"
          x-on:click="togglePanel()"
          class="toggle-button"
        >
          <sl-icon x-bind:name="isExpanded ? 'chevron-up' : 'chevron-down'"></sl-icon>
        </sl-button>
      </div>
      <div class="config-panel-content" x-show="isExpanded" x-transition>
        <div class="config-item">
          <label for="searchDepth">Search Depth</label>
          <sl-range
            id="searchDepth"
            min="0"
            max="10"
            step="1"
            x-bind:value="searchDepth"
            x-on:sl-input="updateSearchDepth($event)"
          ></sl-range>
          <span class="config-value" x-text="searchDepth"></span>
        </div>
        <div class="config-item">
          <label for="linkForce">Link Force Factor</label>
          <sl-range
            id="linkForce"
            min="0"
            max="6.0"
            step="0.1"
            x-bind:value="linkForceFactor"
            x-on:sl-input="updateLinkForce($event)"
          ></sl-range>
          <span class="config-value" x-text="linkForceFactor"></span>
        </div>
        <div class="config-item">
          <label for="chargeForce">Charge Force Factor</label>
          <sl-range
            id="chargeForce"
            min="0"
            max="6.0"
            step="0.1"
            x-bind:value="chargeForceFactor"
            x-on:sl-input="updateChargeForce($event)"
          ></sl-range>
          <span class="config-value" x-text="chargeForceFactor"></span>
        </div>
        <div class="config-item">
          <label for="centerForce">Center Force Factor</label>
          <sl-range
            id="centerForce"
            min="0"
            max="0.2"
            step="0.01"
            x-bind:value="centerForceFactor"
            x-on:sl-input="updateCenterForce($event)"
          ></sl-range>
          <span class="config-value" x-text="centerForceFactor"></span>
        </div>
        <div class="config-item">
          <label for="alphaDecay">Alpha Decay</label>
          <sl-range
            id="alphaDecay"
            min="0.01"
            max="0.3"
            step="0.01"
            x-bind:value="alphaDecay"
            x-on:sl-input="updateAlphaDecay($event)"
          ></sl-range>
          <span class="config-value" x-text="alphaDecay"></span>
        </div>
        <div class="config-item">
          <label for="velocityDecay">Velocity Decay</label>
          <sl-range
            id="velocityDecay"
            min="0.1"
            max="1"
            step="0.01"
            x-bind:value="velocityDecay"
            x-on:sl-input="updateVelocityDecay($event)"
          ></sl-range>
          <span class="config-value" x-text="velocityDecay"></span>
        </div>
        <div class="config-item">
          <label>Graph Layout</label>
          <div class="layout-controls">
            <sl-switch
              x-bind:checked="pinRootNode"
              x-on:sl-change="updatePinRootNode($event)"
            >
              Pin Root to Center
            </sl-switch>
            <sl-button
              variant="primary"
              size="small"
              x-on:click="pinRootNodeToCenter()"
            >
              Pin Root Now
            </sl-button>
          </div>
        </div>
      </div>
    </div>
  `;
  container.appendChild(div);

  // Initialize Alpine.js data
  window.configPanel = () => ({
    linkForceFactor: config.linkForceFactor,
    chargeForceFactor: config.chargeForceFactor,
    centerForceFactor: config.centerForceFactor,
    alphaDecay: config.alphaDecay,
    velocityDecay: config.velocityDecay,
    searchDepth: config.searchDepth,
    pinRootNode: config.pinRootNode,
    isExpanded: false,

    updateLinkForce(event: CustomEvent) {
      const value = parseFloat((event.target as HTMLInputElement).value);
      this.linkForceFactor = value;
      onConfigChange({ linkForceFactor: value });
    },

    updateChargeForce(event: CustomEvent) {
      const value = parseFloat((event.target as HTMLInputElement).value);
      this.chargeForceFactor = value;
      onConfigChange({ chargeForceFactor: value });
    },

    updateCenterForce(event: CustomEvent) {
      const value = parseFloat((event.target as HTMLInputElement).value);
      this.centerForceFactor = value;
      onConfigChange({ centerForceFactor: value });
    },

    updateAlphaDecay(event: CustomEvent) {
      const value = parseFloat((event.target as HTMLInputElement).value);
      this.alphaDecay = value;
      onConfigChange({ alphaDecay: value });
    },

    updateVelocityDecay(event: CustomEvent) {
      const value = parseFloat((event.target as HTMLInputElement).value);
      this.velocityDecay = value;
      onConfigChange({ velocityDecay: value });
    },

    updateSearchDepth(event: CustomEvent) {
      const value = parseInt((event.target as HTMLInputElement).value);
      this.searchDepth = value;
      onConfigChange({ searchDepth: value });
    },

    updatePinRootNode(event: CustomEvent) {
      const checked = (event.target as HTMLInputElement).checked;
      this.pinRootNode = checked;
      onConfigChange({ pinRootNode: checked });
    },

    pinRootNodeToCenter() {
      if (onPinRootNode) {
        onPinRootNode();
      }
    },

    togglePanel() {
      this.isExpanded = !this.isExpanded;
    },
  });
};

export const addConfigPanelStyles = (): void => {
  const style = document.createElement("style");
  style.textContent = `
    .config-panel {
      position: fixed;
      top: 20px;
      right: 20px;
      width: 300px;
      background: white;
      border: 1px solid #ddd;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      z-index: 1000;
      font-family: system-ui, -apple-system, sans-serif;
    }
    
    .config-panel-header {
      padding: 16px;
      border-bottom: 1px solid #eee;
      background: #f8f9fa;
      border-radius: 8px 8px 0 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .config-panel-header h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #333;
    }
    
    .toggle-button {
      --sl-color-neutral-700: #555;
      --sl-color-neutral-600: #777;
    }
    
    .toggle-button::part(base) {
      padding: 4px;
    }
    
    .config-panel-content {
      padding: 16px;
    }
    
    .config-item {
      margin-bottom: 16px;
    }
    
    .config-item label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
      color: #555;
      font-size: 14px;
    }
    
    .config-value {
      display: inline-block;
      margin-left: 8px;
      font-weight: 600;
      color: #333;
      font-size: 14px;
    }
    
    sl-range {
      width: 100%;
    }
    
    .layout-controls {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    .layout-controls sl-switch {
      margin-bottom: 4px;
    }
  `;
  document.head.appendChild(style);
};
