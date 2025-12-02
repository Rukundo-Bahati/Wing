import { useState } from 'react';
import { useTranslation } from '../contexts/I18nContext';
import { VolumeX, Plus, Loader2 } from 'lucide-react';
import styles from './TabBar.module.css';

interface Tab {
  id: string;
  title: string;
  url: string;
  favicon?: string;
  loading?: boolean;
  isPinned?: boolean;
  isMuted?: boolean;
}

interface TabBarProps {
  tabs: Tab[];
  activeTabId: string;
  onTabClick: (tabId: string) => void;
  onTabClose: (tabId: string) => void;
  onTabContextMenu: (tabId: string, event: React.MouseEvent) => void;
  onNewTab: () => void;
}

export const TabBar: React.FC<TabBarProps> = ({
  tabs,
  activeTabId,
  onTabClick,
  onTabClose,
  onTabContextMenu,
  onNewTab,
}) => {
  const { t } = useTranslation();
  const [draggedTabId, setDraggedTabId] = useState<string | null>(null);

  const handleDragStart = (tabId: string) => {
    setDraggedTabId(tabId);
  };

  const handleDragEnd = () => {
    setDraggedTabId(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetTabId: string) => {
    if (draggedTabId && draggedTabId !== targetTabId) {
      // Handle tab reordering logic here
      console.log(`Reorder tab ${draggedTabId} to position of ${targetTabId}`);
    }
    setDraggedTabId(null);
  };

  const getFavicon = (tab: Tab) => {
    if (tab.favicon) {
      return <img src={tab.favicon} alt="" width={16} height={16} />;
    }
    return <div className={styles.defaultFavicon}>🌐</div>;
  };

  const getTabTitle = (tab: Tab) => {
    if (tab.title) {
      return tab.title.length > 20 ? `${tab.title.substring(0, 20)}...` : tab.title;
    }
    return t('tabs.newTab');
  };

  return (
    <div className={styles['tab-bar']}>
      <div className={styles['tabs-container']}>
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`${styles.tab} ${tab.id === activeTabId ? styles.active : ''} ${
              tab.isPinned ? styles.pinned : ''
            } ${draggedTabId === tab.id ? styles.dragging : ''}`}
            onClick={() => onTabClick(tab.id)}
            onContextMenu={(e) => onTabContextMenu(tab.id, e)}
            draggable
            onDragStart={() => handleDragStart(tab.id)}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(tab.id)}
          >
            <div className={styles['tab-content']}>
              <span className={styles['tab-favicon']}>{getFavicon(tab)}</span>
              {!tab.isPinned && (
                <span className={styles['tab-title']} title={tab.title}>
                  {getTabTitle(tab)}
                </span>
              )}
              {tab.isMuted && <span className={styles['tab-muted']}><VolumeX size={14} /></span>}
              {tab.loading && <span className={styles['tab-loading']}><Loader2 size={14} /></span>}
            </div>
            <button
              className={styles['tab-close']}
              onClick={(e) => {
                e.stopPropagation();
                onTabClose(tab.id);
              }}
              title={t('tabs.closeTab')}
            >
              ×
            </button>
            {tab.id !== activeTabId && <div className={styles['tab-divider']} />}
          </div>
        ))}
      </div>

      <button className={styles['new-tab-button']} onClick={onNewTab} title={t('tabs.newTab')}>
        <Plus size={20} />
      </button>
    </div>
  );
};
