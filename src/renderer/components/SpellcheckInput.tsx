import { useState, useRef } from 'react';
import { useTranslation } from '../contexts/I18nContext';
import { Check, Loader2 } from 'lucide-react';
import styles from './SpellcheckInput.module.css';

interface SpellcheckInputProps {
  value: string;
  onChange: (value: string) => void;
  onSpellcheck: (text: string) => Promise<any>;
  placeholder?: string;
  className?: string;
}

export const SpellcheckInput: React.FC<SpellcheckInputProps> = ({
  value,
  onChange,
  onSpellcheck,
  placeholder = '',
  className = '',
}) => {
  const { t } = useTranslation();
  const [isChecking, setIsChecking] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setShowSuggestions(false);
  };

  const handleSpellcheck = async () => {
    if (!value.trim()) return;

    setIsChecking(true);
    try {
      const result = await onSpellcheck(value);
      if (result && result.suggestions) {
        setSuggestions(result.suggestions);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error('Spellcheck error:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
    setShowSuggestions(false);
  };

  return (
    <div className={`${styles.spellcheckInput} ${className}`}>
      <div className={styles.inputContainer}>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          className={styles.input}
        />
        <button
          type="button"
          onClick={handleSpellcheck}
          disabled={isChecking || !value.trim()}
          className={styles.spellcheckButton}
          title={t('spellcheck.check')}
        >
          {isChecking ? (
            <Loader2 size={16} className={styles.spinning} />
          ) : (
            <Check size={16} />
          )}
        </button>
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className={styles.suggestions}>
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSuggestionClick(suggestion)}
              className={styles.suggestion}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
