import { settingsService } from './settings-service';

export interface SearchEngine {
  id: string;
  name: string;
  searchUrl: string;
  suggestUrl?: string;
  icon?: string;
  isDefault: boolean;
}

export interface SearchOptions {
  language?: string;
  region?: string;
  safeSearch?: boolean;
  resultCount?: number;
}

const DEFAULT_SEARCH_ENGINES: SearchEngine[] = [
  {
    id: 'google',
    name: 'Google',
    searchUrl: 'https://www.google.com/search?q={query}',
    suggestUrl: 'https://www.google.com/complete/search?client=chrome&q={query}',
    icon: '🔍',
    isDefault: true,
  },
  {
    id: 'duckduckgo',
    name: 'DuckDuckGo',
    searchUrl: 'https://duckduckgo.com/?q={query}',
    suggestUrl: 'https://ac.duckduckgo.com/ac/?q={query}',
    icon: '🦆',
    isDefault: false,
  },
  {
    id: 'bing',
    name: 'Bing',
    searchUrl: 'https://www.bing.com/search?q={query}',
    suggestUrl: 'https://www.bing.com/osjson.aspx?query={query}',
    icon: '🅱️',
    isDefault: false,
  },
  {
    id: 'wikipedia-rw',
    name: 'Wikipedia (Kinyarwanda)',
    searchUrl: 'https://rw.wikipedia.org/wiki/Special:Search?search={query}',
    icon: '📚',
    isDefault: false,
  },
];

class SearchService {
  private searchEngines: SearchEngine[] = [...DEFAULT_SEARCH_ENGINES];
  private searchHistory: string[] = [];
  private trendingSearches: string[] = [
    'Irembo',
    'REB',
    'Amakuru ya Rwanda',
    'Akazi',
    'Ishuri',
    'Ubuzima',
  ];

  constructor() {
    this.loadSearchEngines();
    this.loadSearchHistory();
  }

  private loadSearchEngines(): void {
    const saved = settingsService.getSetting('search');
    if (saved.defaultEngine) {
      this.setDefaultSearchEngine(saved.defaultEngine);
    }
  }

  private loadSearchHistory(): void {
    // TODO: Load from storage service
    this.searchHistory = [];
  }

  search(query: string, options?: SearchOptions): string {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return '';

    // Add to search history
    this.addToHistory(trimmedQuery);

    // Get default search engine
    const engine = this.getDefaultSearchEngine();

    // Build search URL
    let searchUrl = engine.searchUrl.replace('{query}', encodeURIComponent(trimmedQuery));

    // Add options if provided
    if (options) {
      const params = new URLSearchParams();

      if (options.language) {
        params.append('hl', options.language);
      }

      if (options.region) {
        params.append('gl', options.region);
      }

      if (options.safeSearch) {
        params.append('safe', 'active');
      }

      if (options.resultCount) {
        params.append('num', options.resultCount.toString());
      }

      const paramString = params.toString();
      if (paramString) {
        searchUrl += (searchUrl.includes('?') ? '&' : '?') + paramString;
      }
    }

    return searchUrl;
  }

  async getSuggestions(query: string): Promise<string[]> {
    const trimmedQuery = query.trim();
    if (!trimmedQuery || trimmedQuery.length < 2) {
      return this.getRecentSearches();
    }

    const engine = this.getDefaultSearchEngine();

    if (!engine.suggestUrl) {
      return this.getLocalSuggestions(trimmedQuery);
    }

    try {
      const suggestUrl = engine.suggestUrl.replace('{query}', encodeURIComponent(trimmedQuery));
      const response = await fetch(suggestUrl);
      const data = await response.json();

      // Google/Bing format: [query, [suggestions]]
      if (Array.isArray(data) && data.length > 1 && Array.isArray(data[1])) {
        return data[1].slice(0, 8);
      }

      // DuckDuckGo format: [{phrase: "..."}]
      if (Array.isArray(data)) {
        return data.map((item: any) => item.phrase || item).slice(0, 8);
      }

      return this.getLocalSuggestions(trimmedQuery);
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
      return this.getLocalSuggestions(trimmedQuery);
    }
  }

  private getLocalSuggestions(query: string): string[] {
    const lowerQuery = query.toLowerCase();

    // Combine history and trending
    const allSuggestions = [...this.searchHistory, ...this.trendingSearches];

    // Filter and sort by relevance
    const filtered = allSuggestions
      .filter((s) => s.toLowerCase().includes(lowerQuery))
      .slice(0, 8);

    return [...new Set(filtered)]; // Remove duplicates
  }

  private getRecentSearches(): string[] {
    return this.searchHistory.slice(0, 5);
  }

  getTrendingSearches(): string[] {
    return [...this.trendingSearches];
  }

  private addToHistory(query: string): void {
    // Remove if already exists
    this.searchHistory = this.searchHistory.filter((q) => q !== query);

    // Add to beginning
    this.searchHistory.unshift(query);

    // Limit history size
    if (this.searchHistory.length > 100) {
      this.searchHistory = this.searchHistory.slice(0, 100);
    }

    // TODO: Save to storage service
  }

  clearSearchHistory(): void {
    this.searchHistory = [];
    // TODO: Clear from storage service
  }

  getSearchEngines(): SearchEngine[] {
    return [...this.searchEngines];
  }

  getDefaultSearchEngine(): SearchEngine {
    return (
      this.searchEngines.find((e) => e.isDefault) || this.searchEngines[0]
    );
  }

  setDefaultSearchEngine(engineId: string): void {
    this.searchEngines = this.searchEngines.map((engine) => ({
      ...engine,
      isDefault: engine.id === engineId,
    }));

    // Save to settings
    settingsService.updateSetting('search', { defaultEngine: engineId });
  }

  addCustomSearchEngine(engine: Omit<SearchEngine, 'isDefault'>): void {
    const newEngine: SearchEngine = {
      ...engine,
      isDefault: false,
    };

    this.searchEngines.push(newEngine);
    // TODO: Save to storage service
  }

  removeSearchEngine(engineId: string): void {
    // Don't allow removing the last engine
    if (this.searchEngines.length <= 1) return;

    const wasDefault = this.searchEngines.find((e) => e.id === engineId)?.isDefault;

    this.searchEngines = this.searchEngines.filter((e) => e.id !== engineId);

    // If removed engine was default, set first engine as default
    if (wasDefault && this.searchEngines.length > 0) {
      this.searchEngines[0].isDefault = true;
    }

    // TODO: Save to storage service
  }

  // Kinyarwanda dictionary integration
  async searchKinyarwandaDictionary(): Promise<string | null> {
    // TODO: Integrate with actual Kinyarwanda dictionary API
    // For now, return null
    return null;
  }

  // Check if query is a URL
  isUrl(query: string): boolean {
    // Check for common URL patterns
    if (query.startsWith('http://') || query.startsWith('https://')) {
      return true;
    }

    if (query.startsWith('wing://')) {
      return true;
    }

    // Check for domain pattern (e.g., example.com)
    const domainPattern = /^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\/.*)?$/;
    if (domainPattern.test(query)) {
      return true;
    }

    // Check for localhost or IP
    if (query.startsWith('localhost') || /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(query)) {
      return true;
    }

    return false;
  }

  // Process query - determine if URL or search
  processQuery(query: string): { type: 'url' | 'search'; value: string } {
    const trimmed = query.trim();

    if (this.isUrl(trimmed)) {
      // Add protocol if missing
      let url = trimmed;
      if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('wing://')) {
        url = 'https://' + url;
      }
      return { type: 'url', value: url };
    }

    return { type: 'search', value: this.search(trimmed) };
  }
}

// Singleton instance
export const searchService = new SearchService();
