import { Graph } from "@adaptivekind/graph-schema";
import { GraphConfiguration } from "./types";
import { findMatchingNodes } from "./suggestions";
import { loadShoelaceAndAlpine } from "./dynamic-loader";

declare global {
  interface Window {
    searchPanel: () => {
      searchQuery: string;
      suggestions: Array<{ id: string; label: string }>;
      selectedSuggestionIndex: number;
      showSuggestions: boolean;
      updateSuggestions: (query: string) => void;
      selectSuggestion: (suggestion: { id: string; label: string }) => void;
    };
  }
}

export interface SearchPanelOptions {
  config: GraphConfiguration;
  container: Element;
  graph: Graph;
  onSearchChange: (searchQuery: string) => void;
}

export const createSearchPanel = async (
  options: SearchPanelOptions,
): Promise<void> => {
  const { config, container, graph, onSearchChange } = options;

  if (!config.searchPanel) {
    return;
  }

  // Load Shoelace and Alpine.js dynamically
  if (config.dynamicLoad && (config.loadAlpine || config.loadShoelace)) {
    await loadShoelaceAndAlpine();
  }

  const div = document.createElement("div");
  div.role = "search";
  div.classList.add("search-panel");
  div.style.zIndex = "10000";

  div.innerHTML = `
    <div class="search-panel" x-data="searchPanel()">
      <div class="search-container">
        <sl-input
          id="searchBox"
          placeholder="Search nodes..."
          clearable
          size="large"
          x-bind:value="searchQuery"
          x-on:sl-input="updateSearch($event)"
          x-on:keydown="handleKeyDown($event)"
          x-on:focus="showSuggestions = true"
          x-on:blur="handleBlur()"
        >
          <sl-icon name="search" slot="prefix"></sl-icon>
        </sl-input>
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
  `;
  container.appendChild(div);

  // Initialize Alpine.js data
  window.searchPanel = () => ({
    searchQuery: config.searchQuery,
    suggestions: [],
    selectedSuggestionIndex: -1,
    showSuggestions: false,

    updateSearch(event: CustomEvent) {
      const value = (event.target as HTMLInputElement).value;
      this.searchQuery = value;
      this.updateSuggestions(value);
      onSearchChange(value);
    },

    updateSuggestions(query: string) {
      if (!query || query.trim() === "") {
        this.suggestions = [];
        this.showSuggestions = false;
        return;
      }

      const matchingNodes = findMatchingNodes(graph, query);

      this.suggestions = matchingNodes;
      this.selectedSuggestionIndex = -1;
      this.showSuggestions = matchingNodes.length > 0;
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
      onSearchChange(this.searchQuery);
    },

    handleBlur() {
      setTimeout(() => {
        this.showSuggestions = false;
        this.selectedSuggestionIndex = -1;
      }, 150);
    },
  });
};

export const addSearchPanelStyles = (): void => {
  const style = document.createElement("style");
  style.textContent = `
    .search-panel {
      position: fixed;
      top: 5%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 10000;
      font-family: system-ui, -apple-system, sans-serif;
      pointer-events: none;
    }
    
    .search-container {
      position: relative;
      width: 400px;
      pointer-events: auto;
    }

    .search-panel sl-input {
      width: 100%;
      --sl-input-border-radius-medium: 25px;
      --sl-input-height-large: 50px;
      --sl-input-font-size-large: 16px;
    }

    .search-panel sl-input::part(base) {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border: 2px solid rgba(0, 0, 0, 0.1);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    }

    .search-panel sl-input::part(input) {
      padding-left: 16px;
    }

    .search-panel .suggestions-dropdown {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border: 2px solid rgba(0, 0, 0, 0.1);
      border-top: none;
      border-radius: 0 0 12px 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      z-index: 10001;
      max-height: 200px;
      overflow-y: auto;
      margin-top: -2px;
    }

    .search-panel .suggestion-item {
      padding: 12px 16px;
      cursor: pointer;
      border-bottom: 1px solid rgba(0, 0, 0, 0.05);
      font-size: 14px;
      color: #333;
      transition: background-color 0.2s;
    }

    .search-panel .suggestion-item:last-child {
      border-bottom: none;
    }

    .search-panel .suggestion-item:hover,
    .search-panel .suggestion-item.selected {
      background-color: rgba(0, 0, 0, 0.05);
    }

    .search-panel .suggestion-item.selected {
      background-color: rgba(59, 130, 246, 0.1);
    }
  `;
  document.head.appendChild(style);
};
