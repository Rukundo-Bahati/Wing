import { useTranslation } from '../contexts/I18nContext';
import { ArrowLeft, ArrowRight, RotateCw, X, Home, Star, Puzzle, Settings } from 'lucide-react';
import styles from './Toolbar.module.css';

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
    <div className={styles.toolbar}>
      <div className={styles['toolbar-group']}>
        <button
          className={styles['toolbar-button']}
          onClick={onBack}
          disabled={!canGoBack}
          title={t('menu.view.back')}
        >
          <ArrowLeft size={18} />
        </button>

        <button
          className={styles['toolbar-button']}
          onClick={onForward}
          disabled={!canGoForward}
          title={t('menu.view.forward')}
        >
          <ArrowRight size={18} />
        </button>

        {isLoading ? (
          <button className={styles['toolbar-button']} onClick={onStop} title={t('menu.view.stop')}>
            <X size={18} />
          </button>
        ) : (
          <button className={styles['toolbar-button']} onClick={onReload} title={t('menu.view.reload')}>
            <RotateCw size={18} />
          </button>
        )}

        <button className={styles['toolbar-button']} onClick={onHome} title={t('common.actions.open')}>
          <Home size={18} />
        </button>
      </div>

      <div className={styles['toolbar-group']}>
        <button
          className={styles['toolbar-button']}
          onClick={onBookmarks}
          title={t('menu.bookmarks.label')}
        >
          <Star size={18} />
        </button>

        <button className={styles['toolbar-button']} onClick={onExtensions} title={t('menu.help.label')}>
          <Puzzle size={18} />
        </button>

        <button className={styles['toolbar-button']} onClick={onSettings} title={t('settings.title')}>
          <Settings size={18} />
        </button>
      </div>
    </div>
  );
}
