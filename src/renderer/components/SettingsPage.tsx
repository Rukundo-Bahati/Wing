import { useState } from 'react';
import { useTranslation } from '../contexts/I18nContext';
import SearchEngineSettings from './SearchEngineSettings';
import { Settings, Palette, Lock, Search, Wrench } from 'lucide-react';

type SettingsCategory = 'general' | 'appearance' | 'privacy' | 'search' | 'advanced';

export default function SettingsPage({ onClose }: { onClose: () => void }) {
  const { t, locale, setLocale } = useTranslation();
  const [activeCategory, setActiveCategory] = useState<SettingsCategory>('general');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock settings state (in production, load from settings service)
  const [settings, setSettings] = useState({
    general: {
      language: locale,
      homepage: 'wing://newtab',
      downloadsLocation: '',
    },
    appearance: {
      theme: 'system' as 'light' | 'dark' | 'system',
      fontSize: 14,
      zoom: 100,
    },
    privacy: {
      blockTrackers: true,
      blockThirdPartyCookies: true,
      doNotTrack: true,
      httpsOnly: true,
      safeMode: false,
    },
  });

  const getIconComponent = (id: SettingsCategory) => {
    const iconProps = { size: 20 };
    switch (id) {
      case 'general': return <Settings {...iconProps} />;
      case 'appearance': return <Palette {...iconProps} />;
      case 'privacy': return <Lock {...iconProps} />;
      case 'search': return <Search {...iconProps} />;
      case 'advanced': return <Wrench {...iconProps} />;
    }
  };

  const categories: Array<{ id: SettingsCategory }> = [
    { id: 'general' },
    { id: 'appearance' },
    { id: 'privacy' },
    { id: 'search' },
    { id: 'advanced' },
  ];

  const handleLanguageChange = async (newLocale: string) => {
    await setLocale(newLocale);
    setSettings({
      ...settings,
      general: { ...settings.general, language: newLocale },
    });
  };

  const renderGeneralSettings = () => (
    <div className="settings-section">
      <h2>{t('settings.general.title')}</h2>

      <div className="setting-item">
        <label>{t('settings.general.language')}</label>
        <select value={settings.general.language} onChange={(e) => handleLanguageChange(e.target.value)}>
          <option value="rw">Kinyarwanda</option>
          <option value="en">English</option>
        </select>
      </div>

      <div className="setting-item">
        <label>{t('settings.general.homepage')}</label>
        <input
          type="text"
          value={settings.general.homepage}
          onChange={(e) =>
            setSettings({
              ...settings,
              general: { ...settings.general, homepage: e.target.value },
            })
          }
          placeholder="wing://newtab"
        />
      </div>

      <div className="setting-item">
        <label>{t('settings.general.downloadsLocation')}</label>
        <div className="input-with-button">
          <input
            type="text"
            value={settings.general.downloadsLocation || 'Default'}
            readOnly
          />
          <button>Browse...</button>
        </div>
      </div>
    </div>
  );

  const renderAppearanceSettings = () => (
    <div className="settings-section">
      <h2>{t('settings.appearance.title')}</h2>

      <div className="setting-item">
        <label>{t('settings.appearance.theme')}</label>
        <select
          value={settings.appearance.theme}
          onChange={(e) =>
            setSettings({
              ...settings,
              appearance: { ...settings.appearance, theme: e.target.value as any },
            })
          }
        >
          <option value="light">{t('settings.appearance.light')}</option>
          <option value="dark">{t('settings.appearance.dark')}</option>
          <option value="system">{t('settings.appearance.system')}</option>
        </select>
      </div>

      <div className="setting-item">
        <label>{t('settings.appearance.fontSize')}</label>
        <div className="slider-container">
          <input
            type="range"
            min="10"
            max="24"
            value={settings.appearance.fontSize}
            onChange={(e) =>
              setSettings({
                ...settings,
                appearance: { ...settings.appearance, fontSize: parseInt(e.target.value) },
              })
            }
          />
          <span>{settings.appearance.fontSize}px</span>
        </div>
      </div>

      <div className="setting-item">
        <label>{t('settings.appearance.zoom')}</label>
        <div className="slider-container">
          <input
            type="range"
            min="50"
            max="200"
            step="10"
            value={settings.appearance.zoom}
            onChange={(e) =>
              setSettings({
                ...settings,
                appearance: { ...settings.appearance, zoom: parseInt(e.target.value) },
              })
            }
          />
          <span>{settings.appearance.zoom}%</span>
        </div>
      </div>
    </div>
  );

  const renderPrivacySettings = () => (
    <div className="settings-section">
      <h2>{t('settings.privacy.title')}</h2>

      <div className="setting-item">
        <div className="setting-toggle">
          <div>
            <strong>{t('settings.privacy.blockTrackers')}</strong>
            <p className="setting-description">Block third-party trackers and analytics</p>
          </div>
          <label className="toggle">
            <input
              type="checkbox"
              checked={settings.privacy.blockTrackers}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  privacy: { ...settings.privacy, blockTrackers: e.target.checked },
                })
              }
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
      </div>

      <div className="setting-item">
        <div className="setting-toggle">
          <div>
            <strong>{t('settings.privacy.blockThirdPartyCookies')}</strong>
            <p className="setting-description">Prevent cross-site tracking</p>
          </div>
          <label className="toggle">
            <input
              type="checkbox"
              checked={settings.privacy.blockThirdPartyCookies}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  privacy: { ...settings.privacy, blockThirdPartyCookies: e.target.checked },
                })
              }
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
      </div>

      <div className="setting-item">
        <div className="setting-toggle">
          <div>
            <strong>{t('settings.privacy.doNotTrack')}</strong>
            <p className="setting-description">Send Do Not Track header</p>
          </div>
          <label className="toggle">
            <input
              type="checkbox"
              checked={settings.privacy.doNotTrack}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  privacy: { ...settings.privacy, doNotTrack: e.target.checked },
                })
              }
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
      </div>

      <div className="setting-item">
        <div className="setting-toggle">
          <div>
            <strong>{t('settings.privacy.httpsOnly')}</strong>
            <p className="setting-description">Always use secure connections</p>
          </div>
          <label className="toggle">
            <input
              type="checkbox"
              checked={settings.privacy.httpsOnly}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  privacy: { ...settings.privacy, httpsOnly: e.target.checked },
                })
              }
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
      </div>

      <div className="setting-item">
        <div className="setting-toggle">
          <div>
            <strong>{t('settings.privacy.safeMode')}</strong>
            <p className="setting-description">Filter inappropriate content</p>
          </div>
          <label className="toggle">
            <input
              type="checkbox"
              checked={settings.privacy.safeMode}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  privacy: { ...settings.privacy, safeMode: e.target.checked },
                })
              }
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
      </div>

      <div className="setting-item">
        <button className="danger-button">{t('settings.privacy.clearBrowsingData')}</button>
      </div>
    </div>
  );

  const renderSearchSettings = () => (
    <div className="settings-section">
      <h2>{t('settings.search.title')}</h2>
      <SearchEngineSettings />
    </div>
  );

  const renderAdvancedSettings = () => (
    <div className="settings-section">
      <h2>{t('settings.advanced.title')}</h2>

      <div className="setting-item">
        <div className="setting-toggle">
          <div>
            <strong>{t('settings.advanced.hardwareAcceleration')}</strong>
            <p className="setting-description">Use GPU for better performance</p>
          </div>
          <label className="toggle">
            <input type="checkbox" defaultChecked />
            <span className="toggle-slider"></span>
          </label>
        </div>
      </div>

      <div className="setting-item">
        <div className="setting-toggle">
          <div>
            <strong>{t('settings.advanced.developerMode')}</strong>
            <p className="setting-description">Enable developer tools</p>
          </div>
          <label className="toggle">
            <input type="checkbox" />
            <span className="toggle-slider"></span>
          </label>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeCategory) {
      case 'general':
        return renderGeneralSettings();
      case 'appearance':
        return renderAppearanceSettings();
      case 'privacy':
        return renderPrivacySettings();
      case 'search':
        return renderSearchSettings();
      case 'advanced':
        return renderAdvancedSettings();
      default:
        return null;
    }
  };

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1>{t('settings.title')}</h1>
        <button className="close-button" onClick={onClose}>
          ×
        </button>
      </div>

      <div className="settings-search">
        <input
          type="text"
          placeholder="Search settings..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="settings-content">
        <nav className="settings-sidebar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`category-button ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              <span className="category-icon">{getIconComponent(cat.id)}</span>
              <span className="category-label">{t(`settings.${cat.id}.title`)}</span>
            </button>
          ))}
        </nav>

        <div className="settings-main">{renderContent()}</div>
      </div>

      <style>{`
        .settings-page {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: white;
          z-index: 2000;
          display: flex;
          flex-direction: column;
        }

        .settings-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid #ddd;
        }

        .settings-header h1 {
          margin: 0;
          font-size: 24px;
        }

        .close-button {
          width: 36px;
          height: 36px;
          border: none;
          background: transparent;
          font-size: 28px;
          cursor: pointer;
          border-radius: 6px;
        }

        .close-button:hover {
          background: #f0f0f0;
        }

        .settings-search {
          padding: 16px 24px;
          border-bottom: 1px solid #ddd;
        }

        .settings-search input {
          width: 100%;
          padding: 10px 16px;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 14px;
        }

        .settings-content {
          flex: 1;
          display: flex;
          overflow: hidden;
        }

        .settings-sidebar {
          width: 240px;
          border-right: 1px solid #ddd;
          padding: 16px 0;
          overflow-y: auto;
        }

        .category-button {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 24px;
          border: none;
          background: none;
          cursor: pointer;
          font-size: 15px;
          text-align: left;
          transition: background 0.2s;
        }

        .category-button:hover {
          background: #f5f5f5;
        }

        .category-button.active {
          background: #e8f4ff;
          color: #4a90e2;
          font-weight: 500;
        }

        .category-icon {
          display: flex;
          align-items: center;
        }

        .settings-main {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
        }

        .settings-section h2 {
          margin: 0 0 24px 0;
          font-size: 20px;
        }

        .setting-item {
          margin-bottom: 24px;
        }

        .setting-item label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          font-size: 14px;
        }

        .setting-item input[type="text"],
        .setting-item select {
          width: 100%;
          max-width: 400px;
          padding: 10px 12px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 14px;
        }

        .input-with-button {
          display: flex;
          gap: 8px;
          max-width: 400px;
        }

        .input-with-button input {
          flex: 1;
        }

        .input-with-button button {
          padding: 10px 16px;
          border: 1px solid #ddd;
          background: white;
          border-radius: 6px;
          cursor: pointer;
        }

        .slider-container {
          display: flex;
          align-items: center;
          gap: 16px;
          max-width: 400px;
        }

        .slider-container input[type="range"] {
          flex: 1;
        }

        .slider-container span {
          min-width: 60px;
          text-align: right;
          font-weight: 500;
        }

        .setting-toggle {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
        }

        .setting-description {
          margin: 4px 0 0 0;
          font-size: 13px;
          color: #666;
        }

        .toggle {
          position: relative;
          display: inline-block;
          width: 48px;
          height: 26px;
          flex-shrink: 0;
        }

        .toggle input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .toggle-slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #ccc;
          transition: 0.3s;
          border-radius: 26px;
        }

        .toggle-slider:before {
          position: absolute;
          content: "";
          height: 20px;
          width: 20px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          transition: 0.3s;
          border-radius: 50%;
        }

        .toggle input:checked + .toggle-slider {
          background-color: #4a90e2;
        }

        .toggle input:checked + .toggle-slider:before {
          transform: translateX(22px);
        }

        .danger-button {
          padding: 10px 20px;
          background: #ff4444;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
        }

        .danger-button:hover {
          background: #cc0000;
        }
      `}</style>
    </div>
  );
}
