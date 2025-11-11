import { storageService } from './storage-service';

export interface BrowserSettings {
  general: {
    language: string;
    homepage: string;
    defaultSearchEngine: string;
    downloadsLocation: string;
  };
  appearance: {
    theme: 'light' | 'dark' | 'system';
    fontSize: number;
    fontFamily: string;
    zoom: number;
  };
  privacy: {
    blockTrackers: boolean;
    blockThirdPartyCookies: boolean;
    doNotTrack: boolean;
    httpsOnly: boolean;
    telemetryEnabled: boolean;
    safeMode: boolean;
  };
  search: {
    defaultEngine: string;
    showSuggestions: boolean;
  };
  advanced: {
    hardwareAcceleration: boolean;
    developerMode: boolean;
  };
}

const DEFAULT_SETTINGS: BrowserSettings = {
  general: {
    language: 'rw',
    homepage: 'wing://newtab',
    defaultSearchEngine: 'google',
    downloadsLocation: '',
  },
  appearance: {
    theme: 'system',
    fontSize: 14,
    fontFamily: 'system-ui',
    zoom: 1.0,
  },
  privacy: {
    blockTrackers: true,
    blockThirdPartyCookies: true,
    doNotTrack: true,
    httpsOnly: true,
    telemetryEnabled: false,
    safeMode: false,
  },
  search: {
    defaultEngine: 'google',
    showSuggestions: true,
  },
  advanced: {
    hardwareAcceleration: true,
    developerMode: false,
  },
};

class SettingsService {
  private settings: BrowserSettings = DEFAULT_SETTINGS;
  private listeners: Set<(settings: BrowserSettings) => void> = new Set();

  initialize(): void {
    this.loadSettings();
  }

  private loadSettings(): void {
    try {
      const saved = storageService.getSetting<BrowserSettings>('browserSettings');
      if (saved) {
        this.settings = this.mergeSettings(DEFAULT_SETTINGS, saved);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      this.settings = DEFAULT_SETTINGS;
    }
  }

  private mergeSettings(defaults: BrowserSettings, saved: Partial<BrowserSettings>): BrowserSettings {
    return {
      general: { ...defaults.general, ...saved.general },
      appearance: { ...defaults.appearance, ...saved.appearance },
      privacy: { ...defaults.privacy, ...saved.privacy },
      search: { ...defaults.search, ...saved.search },
      advanced: { ...defaults.advanced, ...saved.advanced },
    };
  }

  getSettings(): BrowserSettings {
    return { ...this.settings };
  }

  getSetting<K extends keyof BrowserSettings>(
    category: K
  ): BrowserSettings[K] {
    return { ...this.settings[category] };
  }

  updateSettings(updates: Partial<BrowserSettings>): void {
    this.settings = this.mergeSettings(this.settings, updates);
    this.saveSettings();
    this.notifyListeners();
  }

  updateSetting<K extends keyof BrowserSettings>(
    category: K,
    updates: Partial<BrowserSettings[K]>
  ): void {
    this.settings[category] = {
      ...this.settings[category],
      ...updates,
    };
    this.saveSettings();
    this.notifyListeners();
  }

  resetSettings(): void {
    this.settings = DEFAULT_SETTINGS;
    this.saveSettings();
    this.notifyListeners();
  }

  resetCategory<K extends keyof BrowserSettings>(category: K): void {
    this.settings[category] = { ...DEFAULT_SETTINGS[category] };
    this.saveSettings();
    this.notifyListeners();
  }

  private saveSettings(): void {
    try {
      storageService.setSetting('browserSettings', this.settings);
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }

  // Specific setting helpers
  getLanguage(): string {
    return this.settings.general.language;
  }

  setLanguage(language: string): void {
    this.updateSetting('general', { language });
  }

  getTheme(): 'light' | 'dark' | 'system' {
    return this.settings.appearance.theme;
  }

  setTheme(theme: 'light' | 'dark' | 'system'): void {
    this.updateSetting('appearance', { theme });
  }

  getHomepage(): string {
    return this.settings.general.homepage;
  }

  setHomepage(homepage: string): void {
    this.updateSetting('general', { homepage });
  }

  isTrackingBlocked(): boolean {
    return this.settings.privacy.blockTrackers;
  }

  isHTTPSOnly(): boolean {
    return this.settings.privacy.httpsOnly;
  }

  isSafeModeEnabled(): boolean {
    return this.settings.privacy.safeMode;
  }

  // Event listeners
  subscribe(listener: (settings: BrowserSettings) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener(this.getSettings()));
  }

  // Validation
  validateSettings(settings: Partial<BrowserSettings>): string[] {
    const errors: string[] = [];

    if (settings.appearance?.fontSize) {
      if (settings.appearance.fontSize < 10 || settings.appearance.fontSize > 24) {
        errors.push('Font size must be between 10 and 24');
      }
    }

    if (settings.appearance?.zoom) {
      if (settings.appearance.zoom < 0.5 || settings.appearance.zoom > 3.0) {
        errors.push('Zoom must be between 0.5 and 3.0');
      }
    }

    if (settings.general?.homepage) {
      if (!this.isValidUrl(settings.general.homepage)) {
        errors.push('Invalid homepage URL');
      }
    }

    return errors;
  }

  private isValidUrl(url: string): boolean {
    if (url.startsWith('wing://')) return true;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  // Export/Import settings
  exportSettings(): string {
    return JSON.stringify(this.settings, null, 2);
  }

  importSettings(json: string): boolean {
    try {
      const imported = JSON.parse(json) as Partial<BrowserSettings>;
      const errors = this.validateSettings(imported);
      
      if (errors.length > 0) {
        console.error('Invalid settings:', errors);
        return false;
      }

      this.updateSettings(imported);
      return true;
    } catch (error) {
      console.error('Failed to import settings:', error);
      return false;
    }
  }
}

// Singleton instance
export const settingsService = new SettingsService();
