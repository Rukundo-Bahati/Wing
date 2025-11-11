import { useTranslation } from '../contexts/I18nContext';
import { SUPPORTED_LOCALES } from '../../shared/constants';

const LOCALE_NAMES: Record<string, string> = {
  rw: 'Kinyarwanda',
  en: 'English',
};

export default function LanguageSwitcher() {
  const { locale, setLocale } = useTranslation();

  const handleChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    await setLocale(event.target.value);
  };

  return (
    <div className="language-switcher">
      <select value={locale} onChange={handleChange}>
        {SUPPORTED_LOCALES.map((loc) => (
          <option key={loc} value={loc}>
            {LOCALE_NAMES[loc] || loc}
          </option>
        ))}
      </select>
    </div>
  );
}
