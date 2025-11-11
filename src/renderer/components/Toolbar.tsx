import { useTranslation } from '../contexts/I18nContext';
import { ArrowLeft, ArrowRight, RotateCw, X, Home, Star, Puzzle, Settings } from 'lucide-react';

interface ToolbarProps {
  canGoBack: boolean;
  canGoForward: boolean;
  isLoading: boolean;
  onBack: () => void;
  onForward: () => void;
  onReload: () => void;
  onStop: () => void;
  onHome: () => void;
  onBookmarks: () => void;
  onExtensions: () => void;
  onSettings: () => void;
}

export default function Toolbar({
  canGoBack,
  canGoForward,
  isLoading,
  onBack,
  onForward,
  onReload,
  onStop,
  onHome,
  onBookmarks,
  onExtensions,
  onSettings,
}: ToolbarProps) {
  const { t } = useTranslation();

  return (
    <div className="toolbar">
      <div className="toolbar-left">
        <button
          className="toolbar-button"
          onClick={onBack}
          disabled={!canGoBack}
          title={t('menu.view.back')}
        >
          <ArrowLeft size={20} />
        </button>

        <button
          className="toolbar-button"
          onClick={onForward}
          disabled={!canGoForward}
          title={t('menu.view.forward')}
        >
          <ArrowRight size={20} />
        </button>

        {isLoading ? (
          <button className="toolbar-button" onClick={onStop} title={t('menu.view.stop')}>
            <X size={20} />
          </button>
        ) : (
          <button className="toolbar-button" onClick={onReload} title={t('menu.view.reload')}>
            <RotateCw size={20} />
          </button>
        )}

        <button className="toolbar-button" onClick={onHome} title={t('common.actions.open')}>
          <Home size={20} />
        </button>
      </div>

      <div className="toolbar-right">
        <button
          className="toolbar-button"
          onClick={onBookmarks}
          title={t('menu.bookmarks.label')}
        >
          <Star size={20} />
        </button>

        <button className="toolbar-button" onClick={onExtensions} title={t('menu.help.label')}>
          <Puzzle size={20} />
        </button>

        <button className="toolbar-button" onClick={onSettings} title={t('settings.title')}>
          <Settings size={20} />
        </button>
      </div>

      <style>{`
        .toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 12px;
          background: #fff;
          border-bottom: 1px solid #ddd;
          gap: 8px;
        }

        .toolbar-left,
        .toolbar-right {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .toolbar-button {
          width: 36px;
          height: 36px;
          border: none;
          background: transparent;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
          color: #333;
        }

        .toolbar-button:hover:not(:disabled) {
          background: #f0f0f0;
        }

        .toolbar-button:active:not(:disabled) {
          background: #e0e0e0;
        }

        .toolbar-button:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
