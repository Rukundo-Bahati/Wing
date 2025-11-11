import { useState } from 'react';
import { useTranslation } from '../contexts/I18nContext';
import { Search, Bird } from 'lucide-react';

interface SearchEngine {
  id: string;
  name: string;
  searchUrl: string;
  icon?: string;
  isDefault: boolean;
}

export default function SearchEngineSettings() {
  const { t } = useTranslation();
  const [engines, setEngines] = useState<SearchEngine[]>([
    {
      id: 'google',
      name: 'Google',
      searchUrl: 'https://www.google.com/search?q={query}',
      icon: 'search',
      isDefault: true,
    },
    {
      id: 'duckduckgo',
      name: 'DuckDuckGo',
      searchUrl: 'https://duckduckgo.com/?q={query}',
      icon: 'bird',
      isDefault: false,
    },
  ]);

  const [isAdding, setIsAdding] = useState(false);
  const [newEngine, setNewEngine] = useState({
    name: '',
    searchUrl: '',
  });

  const handleSetDefault = (engineId: string) => {
    setEngines(
      engines.map((e) => ({
        ...e,
        isDefault: e.id === engineId,
      }))
    );
    // TODO: Save via IPC
  };

  const handleAddEngine = () => {
    if (!newEngine.name || !newEngine.searchUrl) return;

    const engine: SearchEngine = {
      id: Date.now().toString(),
      name: newEngine.name,
      searchUrl: newEngine.searchUrl,
      icon: 'search',
      isDefault: false,
    };

    setEngines([...engines, engine]);
    setNewEngine({ name: '', searchUrl: '' });
    setIsAdding(false);
    // TODO: Save via IPC
  };

  const handleRemoveEngine = (engineId: string) => {
    if (engines.length <= 1) return;
    setEngines(engines.filter((e) => e.id !== engineId));
    // TODO: Save via IPC
  };

  const getIconComponent = (iconName?: string) => {
    const iconProps = { size: 24 };
    switch (iconName) {
      case 'search': return <Search {...iconProps} />;
      case 'bird': return <Bird {...iconProps} />;
      default: return <Search {...iconProps} />;
    }
  };

  return (
    <div className="search-engine-settings">
      <h3>{t('settings.search.searchEngines')}</h3>

      <div className="engines-list">
        {engines.map((engine) => (
          <div key={engine.id} className="engine-item">
            <span className="engine-icon">{getIconComponent(engine.icon)}</span>
            <div className="engine-info">
              <div className="engine-name">{engine.name}</div>
              <div className="engine-url">{engine.searchUrl}</div>
            </div>
            {engine.isDefault ? (
              <span className="default-badge">{t('settings.search.defaultEngine')}</span>
            ) : (
              <button
                className="set-default-button"
                onClick={() => handleSetDefault(engine.id)}
              >
                Set as default
              </button>
            )}
            {!engine.isDefault && (
              <button
                className="remove-button"
                onClick={() => handleRemoveEngine(engine.id)}
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>

      {isAdding ? (
        <div className="add-engine-form">
          <input
            type="text"
            placeholder="Engine name"
            value={newEngine.name}
            onChange={(e) => setNewEngine({ ...newEngine, name: e.target.value })}
          />
          <input
            type="text"
            placeholder="Search URL (use {query} for search term)"
            value={newEngine.searchUrl}
            onChange={(e) => setNewEngine({ ...newEngine, searchUrl: e.target.value })}
          />
          <div className="form-actions">
            <button onClick={handleAddEngine}>{t('common.actions.save')}</button>
            <button onClick={() => setIsAdding(false)}>{t('common.actions.cancel')}</button>
          </div>
        </div>
      ) : (
        <button className="add-engine-button" onClick={() => setIsAdding(true)}>
          + Add search engine
        </button>
      )}

      <style>{`
        .search-engine-settings {
          padding: 20px;
        }

        .search-engine-settings h3 {
          margin: 0 0 16px 0;
          font-size: 18px;
        }

        .engines-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 16px;
        }

        .engine-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: #f9f9f9;
          border-radius: 8px;
        }

        .engine-icon {
          display: flex;
          align-items: center;
          color: #667eea;
        }

        .engine-info {
          flex: 1;
          min-width: 0;
        }

        .engine-name {
          font-weight: 500;
          font-size: 14px;
        }

        .engine-url {
          font-size: 12px;
          color: #666;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .default-badge {
          padding: 4px 12px;
          background: #4a90e2;
          color: white;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
        }

        .set-default-button {
          padding: 6px 12px;
          background: white;
          border: 1px solid #ddd;
          border-radius: 4px;
          cursor: pointer;
          font-size: 13px;
        }

        .set-default-button:hover {
          background: #f5f5f5;
        }

        .remove-button {
          width: 28px;
          height: 28px;
          border: none;
          background: transparent;
          cursor: pointer;
          border-radius: 4px;
          font-size: 20px;
          color: #999;
        }

        .remove-button:hover {
          background: #ffe0e0;
          color: #ff4444;
        }

        .add-engine-form {
          padding: 16px;
          background: #f9f9f9;
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .add-engine-form input {
          padding: 10px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }

        .form-actions {
          display: flex;
          gap: 8px;
        }

        .form-actions button {
          flex: 1;
          padding: 10px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }

        .form-actions button:first-child {
          background: #4a90e2;
          color: white;
        }

        .form-actions button:last-child {
          background: #ddd;
        }

        .add-engine-button {
          width: 100%;
          padding: 12px;
          background: white;
          border: 2px dashed #ddd;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          color: #666;
        }

        .add-engine-button:hover {
          border-color: #4a90e2;
          color: #4a90e2;
        }
      `}</style>
    </div>
  );
}
