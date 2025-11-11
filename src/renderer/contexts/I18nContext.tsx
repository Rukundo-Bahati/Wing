import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { i18n } from '../../services/i18n';

interface I18nContextType {
  locale: string;
  setLocale: (locale: string) => Promise<void>;
  t: (key: string, params?: Record<string, any>) => string;
  formatDate: (date: Date, options?: Intl.DateTimeFormatOptions) => string;
  formatNumber: (value: number) => string;
  formatRelativeTime: (date: Date) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

interface I18nProviderProps {
  children: ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  const [locale, setLocaleState] = useState(i18n.getLocale());
  const [, forceUpdate] = useState({});

  useEffect(() => {
    // Initialize i18n service
    i18n.initialize(locale).then(() => {
      forceUpdate({});
    });
  }, []);

  const setLocale = async (newLocale: string) => {
    await i18n.setLocale(newLocale);
    setLocaleState(newLocale);
    forceUpdate({});
  };

  const t = (key: string, params?: Record<string, any>) => {
    return i18n.translate(key, params);
  };

  const formatDate = (date: Date, options?: Intl.DateTimeFormatOptions) => {
    return i18n.formatDate(date, options);
  };

  const formatNumber = (value: number) => {
    return i18n.formatNumber(value);
  };

  const formatRelativeTime = (date: Date) => {
    return i18n.formatRelativeTime(date);
  };

  const value: I18nContextType = {
    locale,
    setLocale,
    t,
    formatDate,
    formatNumber,
    formatRelativeTime,
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslation must be used within I18nProvider');
  }
  return context;
}
