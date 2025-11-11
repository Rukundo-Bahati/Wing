import { useState, useRef, useEffect } from 'react';
import { useTranslation } from '../contexts/I18nContext';
import { Lock, AlertTriangle, Globe, Loader2, RotateCw } from 'lucide-react';

interface AddressBarProps {
  url: string;
  loading: boolean;
  securityStatus: 'secure' | 'insecure' | 'unknown';
  onNavigate: (url: string) => void;
  onSearch: (query: string) => void;
}

export default function AddressBar({
  url,
  loading,
  securityStatus,
  onNavigate,
  onSearch,
}: AddressBarProps) {
  const { t } = useTranslation();
  const [inputValue, setInputValue] = useState(url);
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isFocused) {
      setInputValue(url);
    }
  }, [url, isFocused]);

  const isValidUrl = (text: string): boolean => {
    try {
      new URL(text.startsWith('http') ? text : `https://${text}`);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedValue = inputValue.trim();

    if (!trimmedValue) return;

    if (isValidUrl(trimmedValue)) {
      const fullUrl = trimmedValue.startsWith('http')
        ? trimmedValue
        : `https://${trimmedValue}`;
      onNavigate(fullUrl);
    } else {
      onSearch(trimmedValue);
    }

    inputRef.current?.blur();
  };

  const handleFocus = () => {
    setIsFocused(true);
    inputRef.current?.select();
  };

  const handleBlur = () => {
    setIsFocused(false);
    setSuggestions([]);
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    // Get search suggestions
    if (value.length > 1) {
      try {
        // TODO: Call search service via IPC
        // For now, show local suggestions
        const localSuggestions = [
          'irembo.gov.rw',
          'reb.rw',
          'newtimes.co.rw',
        ].filter((s) => s.includes(value.toLowerCase()));
        setSuggestions(localSuggestions);
      } catch (error) {
        setSuggestions([]);
      }
    } else {
      setSuggestions([]);
    }
  };

  const getSecurityIcon = () => {
    const iconProps = { size: 16 };
    if (loading) return <Loader2 {...iconProps} className="spinning" />;
    switch (securityStatus) {
      case 'secure':
        return <Lock {...iconProps} />;
      case 'insecure':
        return <AlertTriangle {...iconProps} />;
      default:
        return <Globe {...iconProps} />;
    }
  };

  return (
    <div className="address-bar-container">
      <form onSubmit={handleSubmit} className="address-bar">
        <span className="security-icon" title={securityStatus}>
          {getSecurityIcon()}
        </span>

        <input
          ref={inputRef}
          type="text"
          className="address-input"
          value={inputValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={t('common.actions.search')}
          spellCheck={false}
          autoComplete="off"
        />

        {loading && <span className="loading-indicator"><RotateCw size={16} /></span>}
      </form>

      {suggestions.length > 0 && (
        <div className="suggestions-dropdown">
          {suggestions.map((suggestion, index) => (
            <div key={index} className="suggestion-item">
              {suggestion}
            </div>
          ))}
        </div>
      )}

      <style>{`
        .address-bar-container {
          position: relative;
          width: 100%;
        }

        .address-bar {
          display: flex;
          align-items: center;
          background: #fff;
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 8px 12px;
          gap: 8px;
          transition: border-color 0.2s;
        }

        .address-bar:focus-within {
          border-color: #4a90e2;
          box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
        }

        .security-icon {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          color: #666;
        }

        .security-icon .spinning {
          animation: spin 1s linear infinite;
        }

        .address-input {
          flex: 1;
          border: none;
          outline: none;
          font-size: 14px;
          font-family: system-ui, -apple-system, sans-serif;
        }

        .loading-indicator {
          display: flex;
          align-items: center;
          color: #4a90e2;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .suggestions-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: #fff;
          border: 1px solid #ddd;
          border-top: none;
          border-radius: 0 0 8px 8px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          max-height: 300px;
          overflow-y: auto;
          z-index: 1000;
        }

        .suggestion-item {
          padding: 10px 12px;
          cursor: pointer;
          transition: background 0.2s;
        }

        .suggestion-item:hover {
          background: #f5f5f5;
        }
      `}</style>
    </div>
  );
}
