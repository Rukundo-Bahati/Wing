import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from '../shared/constants';

export interface TranslationMap {
  [key: string]: string | TranslationMap;
}

class I18nService {
  private currentLocale: string = DEFAULT_LOCALE;
  private translations: Map<string, TranslationMap> = new Map();
  private fallbackLocale: string = 'en';

  async initialize(locale: string = DEFAULT_LOCALE): Promise<void> {
    this.currentLocale = locale;
    await this.loadTranslations(locale);
    
    // Load fallback locale if different
    if (locale !== this.fallbackLocale) {
      await this.loadTranslations(this.fallbackLocale);
    }
  }

  async loadTranslations(locale: string): Promise<TranslationMap> {
    if (!SUPPORTED_LOCALES.includes(locale)) {
      console.warn(`Locale ${locale} is not supported`);
      return {};
    }

    try {
      // Load all translation files for the locale
      const modules = [
        'common',
        'menu',
        'settings',
        'errors',
        'tabs',
        'bookmarks',
        'history',
      ];

      const translations: TranslationMap = {};

      for (const module of modules) {
        try {
          const moduleTranslations = await import(
            `../../locales/${locale}/${module}.json`
          );
          translations[module] = moduleTranslations.default || moduleTranslations;
        } catch (error) {
          console.warn(`Failed to load ${module} translations for ${locale}:`, error);
        }
      }

      this.translations.set(locale, translations);
      return translations;
    } catch (error) {
      console.error(`Failed to load translations for locale ${locale}:`, error);
      return {};
    }
  }

  translate(key: string, params?: Record<string, any>): string {
    const keys = key.split('.');
    let translation = this.getTranslation(keys, this.currentLocale);

    // Fallback to English if not found
    if (translation === key && this.currentLocale !== this.fallbackLocale) {
      translation = this.getTranslation(keys, this.fallbackLocale);
    }

    // Replace parameters if provided
    if (params && typeof translation === 'string') {
      return this.replaceParams(translation, params);
    }

    return typeof translation === 'string' ? translation : key;
  }

  private getTranslation(keys: string[], locale: string): string | TranslationMap {
    const localeTranslations = this.translations.get(locale);
    if (!localeTranslations) return keys.join('.');

    let current: string | TranslationMap = localeTranslations;

    for (const key of keys) {
      if (typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        return keys.join('.');
      }
    }

    return current;
  }

  private replaceParams(text: string, params: Record<string, any>): string {
    return text.replace(/\{(\w+)\}/g, (match, key) => {
      return params[key] !== undefined ? String(params[key]) : match;
    });
  }

  getLocale(): string {
    return this.currentLocale;
  }

  async setLocale(locale: string): Promise<void> {
    if (!SUPPORTED_LOCALES.includes(locale)) {
      console.warn(`Locale ${locale} is not supported`);
      return;
    }

    this.currentLocale = locale;
    
    if (!this.translations.has(locale)) {
      await this.loadTranslations(locale);
    }
  }

  getSupportedLocales(): string[] {
    return [...SUPPORTED_LOCALES];
  }

  // Pluralization helper
  pluralize(count: number, singular: string, plural: string): string {
    return count === 1 ? singular : plural;
  }

  // Format number according to locale
  formatNumber(value: number): string {
    return new Intl.NumberFormat(this.currentLocale).format(value);
  }

  // Format date according to locale
  formatDate(date: Date, options?: Intl.DateTimeFormatOptions): string {
    return new Intl.DateTimeFormat(this.currentLocale, options).format(date);
  }

  // Format relative time (e.g., "2 hours ago")
  formatRelativeTime(date: Date): string {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return this.translate('common.time.justNow');
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return this.translate('common.time.minutesAgo', { count: minutes });
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return this.translate('common.time.hoursAgo', { count: hours });
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return this.translate('common.time.daysAgo', { count: days });
    } else {
      return this.formatDate(date, { year: 'numeric', month: 'short', day: 'numeric' });
    }
  }
}

// Singleton instance
export const i18n = new I18nService();

// Shorthand function for translation
export const t = (key: string, params?: Record<string, any>): string => {
  return i18n.translate(key, params);
};
