import { GraphConfiguration } from "./types";

export interface ConfigPanelOptions {
  config: GraphConfiguration;
  onConfigChange: (config: Partial<GraphConfiguration>) => void;
}

export const createConfigPanel = (options: ConfigPanelOptions): void => {
  const { config, onConfigChange } = options;

  if (!config.configPanel) {
    return;
  }

  const container = document.querySelector(config.containerSelector);
  if (!container) {
    // non-fatal
    return;
  }

  const div = document.createElement("div");
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
      </div>
      <div class="config-panel-content">
        <div class="config-item">
          <label for="linkForce">Link Force Factor</label>
          <sl-range
            id="linkForce"
            min="0"
            max="3.0"
            step="0.2"
            x-bind:value="linkForceFactor"
            x-on:sl-change="updateLinkForce($event)"
          ></sl-range>
          <span class="config-value" x-text="linkForceFactor"></span>
        </div>
        <div class="config-item">
          <label for="chargeForce">Charge Force Factor</label>
          <sl-range
            id="chargeForce"
            min="0"
            max="3.0"
            step="0.5"
            x-bind:value="chargeForceFactor"
            x-on:sl-change="updateChargeForce($event)"
          ></sl-range>
          <span class="config-value" x-text="chargeForceFactor"></span>
        </div>
        <div class="config-item">
          <label for="centerForce">Center Force Factor</label>
          <sl-range
            id="centerForce"
            min="0"
            max="1"
            step="0.1"
            x-bind:value="centerForceFactor"
            x-on:sl-change="updateCenterForce($event)"
          ></sl-range>
          <span class="config-value" x-text="centerForceFactor"></span>
        </div>
        <div class="config-item">
          <label for="alphaDecay">Alpha Decay</label>
          <sl-range
            id="alphaDecay"
            min="0.001"
            max="0.1"
            step="0.001"
            x-bind:value="alphaDecay"
            x-on:sl-change="updateAlphaDecay($event)"
          ></sl-range>
          <span class="config-value" x-text="alphaDecay"></span>
        </div>
        <div class="config-item">
          <label for="velocityDecay">Velocity Decay</label>
          <sl-range
            id="velocityDecay"
            min="0.1"
            max="1.0"
            step="0.1"
            x-bind:value="velocityDecay"
            x-on:sl-change="updateVelocityDecay($event)"
          ></sl-range>
          <span class="config-value" x-text="velocityDecay"></span>
        </div>
      </div>
    </div>
  `;
  container?.appendChild(div);

  // Initialize Alpine.js data
  (window as any).configPanel = () => ({
    linkForceFactor: config.linkForceFactor,
    chargeForceFactor: config.chargeForceFactor,
    centerForceFactor: config.centerForceFactor,
    alphaDecay: config.alphaDecay,
    velocityDecay: config.velocityDecay,

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
    }
    
    .config-panel-header h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #333;
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
  `;
  document.head.appendChild(style);
};
