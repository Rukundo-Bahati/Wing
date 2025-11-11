import { useState, useEffect, useRef } from 'react';
import { useTranslation } from '../contexts/I18nContext';

interface SpellcheckInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  multiline?: boolean;
  rows?: number;
}

interface SpellcheckError {
  word: string;
  index: number;
  suggestions: string[];
}

export default function SpellcheckInput({
  value,
  onChange,
  placeholder,
  className = '',
  multiline = false,
  rows = 3,
}: SpellcheckInputProps) {
  const { locale } = useTranslation();
  const [errors, setErrors] = useState<SpellcheckError[]>([]);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    word: string;
    suggestions: string[];
  } | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | HTMLInputElement>(null);
  const checkTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Debounce spellcheck
    if (checkTimeoutRef.current) {
      clearTimeout(checkTimeoutRef.current);
    }

    checkTimeoutRef.current = setTimeout(() => {
      checkSpelling(value);
    }, 500);

    return () => {
      if (checkTimeoutRef.current) {
        clearTimeout(checkTimeoutRef.current);
      }
    };
  }, [value, locale]);

  const checkSpelling = async (text: string) => {
    if (!text.trim() || !window.electronAPI) return;

    try {
      const results = await window.electronAPI.checkText(text, locale);
      const newErrors: SpellcheckError[] = [];

      for (const result of results) {
        if (!result.correct) {
          const suggestions = await window.electronAPI.getSuggestions(result.word, locale);
          newErrors.push({
            word: result.word,
            index: result.index,
            suggestions,
          });
        }
      }

      setErrors(newErrors);
    } catch (error) {
      console.error('Spellcheck error:', error);
    }
  };

  const handleContextMenu = async (e: React.MouseEvent) => {
    e.preventDefault();

    if (!inputRef.current) return;

    const input = inputRef.current;
    const cursorPosition = input.selectionStart || 0;

    // Find word at cursor position
    const textBeforeCursor = value.substring(0, cursorPosition);
    const textAfterCursor = value.substring(cursorPosition);

    const wordBefore = textBeforeCursor.match(/[\w']+$/)?.[0] || '';
    const wordAfter = textAfterCursor.match(/^[\w']+/)?.[0] || '';
    const word = wordBefore + wordAfter;

    if (!word) return;

    // Check if word has errors
    const error = errors.find((err) => err.word.toLowerCase() === word.toLowerCase());

    if (error) {
      setContextMenu({
        x: e.clientX,
        y: e.clientY,
        word: error.word,
        suggestions: error.suggestions,
      });
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (!contextMenu || !inputRef.current) return;

    const input = inputRef.current;
    const cursorPosition = input.selectionStart || 0;

    // Find and replace the word
    const textBeforeCursor = value.substring(0, cursorPosition);
    const textAfterCursor = value.substring(cursorPosition);

    const wordBefore = textBeforeCursor.match(/[\w']+$/)?.[0] || '';
    const wordAfter = textAfterCursor.match(/^[\w']+/)?.[0] || '';

    const startIndex = cursorPosition - wordBefore.length;
    const endIndex = cursorPosition + wordAfter.length;

    const newValue = value.substring(0, startIndex) + suggestion + value.substring(endIndex);
    onChange(newValue);

    setContextMenu(null);
  };

  const handleAddToDictionary = () => {
    if (!contextMenu || !window.electronAPI) return;

    window.electronAPI.addWordToDictionary(contextMenu.word, locale);
    setErrors(errors.filter((err) => err.word !== contextMenu.word));
    setContextMenu(null);
  };

  const getHighlightedText = () => {
    if (errors.length === 0) return value;

    let result = value;
    const sortedErrors = [...errors].sort((a, b) => b.index - a.index);

    for (const error of sortedErrors) {
      const before = result.substring(0, error.index);
      const word = result.substring(error.index, error.index + error.word.length);
      const after = result.substring(error.index + error.word.length);

      result = before + `<span class="spellcheck-error">${word}</span>` + after;
    }

    return result;
  };

  const InputComponent = multiline ? 'textarea' : 'input';

  return (
    <div className="spellcheck-input-container">
      <InputComponent
        ref={inputRef as any}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onContextMenu={handleContextMenu}
        placeholder={placeholder}
        className={`spellcheck-input ${className}`}
        rows={multiline ? rows : undefined}
        spellCheck={false}
      />

      {contextMenu && (
        <>
          <div className="context-menu-overlay" onClick={() => setContextMenu(null)} />
          <div
            className="spellcheck-context-menu"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            {contextMenu.suggestions.length > 0 ? (
              <>
                <div className="context-menu-section">
                  {contextMenu.suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      className="context-menu-item suggestion"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
                <div className="context-menu-divider" />
              </>
            ) : (
              <div className="context-menu-item disabled">No suggestions</div>
            )}
            <button className="context-menu-item" onClick={handleAddToDictionary}>
              Add to dictionary
            </button>
          </div>
        </>
      )}

      <style>{`
        .spellcheck-input-container {
          position: relative;
          width: 100%;
        }

        .spellcheck-input {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
          font-family: inherit;
          resize: vertical;
        }

        .spellcheck-input:focus {
          outline: none;
          border-color: #4a90e2;
        }

        .spellcheck-error {
          text-decoration: underline wavy red;
        }

        .context-menu-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 999;
        }

        .spellcheck-context-menu {
          position: fixed;
          background: white;
          border: 1px solid #ddd;
          border-radius: 6px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          padding: 4px 0;
          min-width: 180px;
          z-index: 1000;
        }

        .context-menu-section {
          padding: 4px 0;
        }

        .context-menu-item {
          display: block;
          width: 100%;
          padding: 8px 16px;
          border: none;
          background: none;
          text-align: left;
          cursor: pointer;
          font-size: 14px;
          transition: background 0.2s;
        }

        .context-menu-item:hover:not(.disabled) {
          background: #f5f5f5;
        }

        .context-menu-item.suggestion {
          font-weight: 500;
          color: #4a90e2;
        }

        .context-menu-item.disabled {
          color: #999;
          cursor: default;
        }

        .context-menu-divider {
          height: 1px;
          background: #eee;
          margin: 4px 0;
        }
      `}</style>
    </div>
  );
}
