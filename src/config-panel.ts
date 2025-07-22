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
      searchQuery: string;
      searchDepth: number;
      suggestions: Array<{ id: string; label: string }>;
      selectedSuggestionIndex: number;
      showSuggestions: boolean;
      updateSuggestions: (query: string) => void;
      selectSuggestion: (suggestion: { id: string; label: string }) => void;
    };
  }
}

export interface ConfigPanelOptions {
  config: GraphConfiguration;
  container: Element;
  graph: Graph;
  onConfigChange: (config: Partial<GraphConfiguration>) => void;
  onSearchChange?: (searchQuery: string, searchDepth: number) => void;
}

export const createConfigPanel = async (
  options: ConfigPanelOptions,
): Promise<void> => {
  const { config, container, graph, onConfigChange, onSearchChange } = options;

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
      </div>
      <div class="config-panel-content">
        <div class="config-item">
          <label for="searchBox">Search Nodes</label>
          <div class="search-container">
            <sl-input
              id="searchBox"
              placeholder="Type to filter nodes..."
              clearable
              x-bind:value="searchQuery"
              x-on:sl-input="updateSearch($event)"
              x-on:keydown="handleKeyDown($event)"
              x-on:focus="showSuggestions = true"
              x-on:blur="handleBlur()"
            ></sl-input>
            <div 
              class="suggestions-dropdown" 
              x-show="showSuggestions && suggestions.length > 0"
              x-transition
            >
              <template x-for="(suggestion, index) in suggestions" :key="suggestion.id">
                <div 
                  class="suggestion-item"
                  x-bind:class="{ 'selected': index === selectedSuggestionIndex }"
                  x-on:click="selectSuggestion(suggestion)"
                  x-on:mouseenter="selectedSuggestionIndex = index"
                  x-text="suggestion.label || suggestion.id"
                ></div>
              </template>
            </div>
          </div>
        </div>
        <div class="config-item">
          <label for="searchDepth">Search Depth</label>
          <sl-range
            id="searchDepth"
            min="0"
            max="5"
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
    searchQuery: "",
    searchDepth: 1,
    suggestions: [],
    selectedSuggestionIndex: -1,
    showSuggestions: false,

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

    updateSearch(event: CustomEvent) {
      const value = (event.target as HTMLInputElement).value;
      this.searchQuery = value;
      this.updateSuggestions(value);
      if (onSearchChange) {
        onSearchChange(value, this.searchDepth);
      }
    },

    updateSuggestions(query: string) {
      if (!query || query.trim() === "") {
        this.suggestions = [];
        this.showSuggestions = false;
        return;
      }

      const lowerQuery = query.toLowerCase().trim();
      const matchingNodes = Object.entries(graph.nodes)
        .filter(([id, node]) => {
          const nodeLabel = (node?.label || id).toLowerCase();
          const nodeId = id.toLowerCase();

          // Match if query appears at start, after word boundaries, or after common separators/lowercase letters
          const startsWithRegex = new RegExp(
            `^${lowerQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`,
            "i",
          );
          const wordBoundaryRegex = new RegExp(
            `[\\s\\-_\\.]${lowerQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`,
            "i",
          );
          const afterWordRegex = new RegExp(
            `[a-z]${lowerQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`,
            "i",
          );

          const labelMatches =
            startsWithRegex.test(nodeLabel) ||
            wordBoundaryRegex.test(nodeLabel) ||
            afterWordRegex.test(nodeLabel);
          const idMatches =
            startsWithRegex.test(nodeId) ||
            wordBoundaryRegex.test(nodeId) ||
            afterWordRegex.test(nodeId);

          // Exclude exact matches
          return (
            (labelMatches || idMatches) &&
            nodeLabel !== lowerQuery &&
            nodeId !== lowerQuery
          );
        })
        .sort(([aId, aNode], [bId, bNode]) => {
          // Prioritize exact starts with matches
          const aLabel = (aNode?.label || aId).toLowerCase();
          const bLabel = (bNode?.label || bId).toLowerCase();
          const aStartsWith =
            aLabel.startsWith(lowerQuery) ||
            aId.toLowerCase().startsWith(lowerQuery);
          const bStartsWith =
            bLabel.startsWith(lowerQuery) ||
            bId.toLowerCase().startsWith(lowerQuery);

          if (aStartsWith && !bStartsWith) return -1;
          if (!aStartsWith && bStartsWith) return 1;

          // Then sort alphabetically
          return aLabel.localeCompare(bLabel);
        })
        .slice(0, 5)
        .map(([id, node]) => ({
          id,
          label: node?.label || id,
        }));

      this.suggestions = matchingNodes;
      this.selectedSuggestionIndex = -1;
      this.showSuggestions = matchingNodes.length > 0;
    },

    updateSearchDepth(event: CustomEvent) {
      const value = parseInt((event.target as HTMLInputElement).value);
      this.searchDepth = value;
      if (onSearchChange) {
        onSearchChange(this.searchQuery, value);
      }
    },

    handleKeyDown(event: KeyboardEvent) {
      if (!this.showSuggestions || this.suggestions.length === 0) {
        return;
      }

      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          this.selectedSuggestionIndex = Math.min(
            this.selectedSuggestionIndex + 1,
            this.suggestions.length - 1,
          );
          break;
        case "ArrowUp":
          event.preventDefault();
          this.selectedSuggestionIndex = Math.max(
            this.selectedSuggestionIndex - 1,
            0,
          );
          break;
        case "Enter":
          event.preventDefault();
          if (this.selectedSuggestionIndex >= 0) {
            const suggestion = this.suggestions[this.selectedSuggestionIndex];
            this.selectSuggestion(suggestion);
          }
          break;
        case "Escape":
          event.preventDefault();
          this.showSuggestions = false;
          this.selectedSuggestionIndex = -1;
          break;
      }
    },

    selectSuggestion(suggestion: { id: string; label: string }) {
      this.searchQuery = suggestion.label || suggestion.id;
      this.showSuggestions = false;
      this.selectedSuggestionIndex = -1;
      if (onSearchChange) {
        onSearchChange(this.searchQuery, this.searchDepth);
      }
    },

    handleBlur() {
      setTimeout(() => {
        this.showSuggestions = false;
        this.selectedSuggestionIndex = -1;
      }, 150);
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

    .search-container {
      position: relative;
    }

    .suggestions-dropdown {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: white;
      border: 1px solid #ddd;
      border-top: none;
      border-radius: 0 0 4px 4px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      z-index: 1000;
      max-height: 200px;
      overflow-y: auto;
    }

    .suggestion-item {
      padding: 8px 12px;
      cursor: pointer;
      border-bottom: 1px solid #eee;
      font-size: 14px;
      color: #333;
      transition: background-color 0.2s;
    }

    .suggestion-item:last-child {
      border-bottom: none;
    }

    .suggestion-item:hover,
    .suggestion-item.selected {
      background-color: #f0f0f0;
    }

    .suggestion-item.selected {
      background-color: #e3f2fd;
    }
  `;
  document.head.appendChild(style);
};
