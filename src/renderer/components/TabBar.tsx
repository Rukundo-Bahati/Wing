import { useState } from 'react';
import { useTranslation } from '../contexts/I18nContext';
import { Tab } from '../../shared/types';
import { Globe, VolumeX, Loader2, Plus } from 'lucide-react';

interface TabBarProps {
  tabs: Tab[];
  activeTabId: string;
  onTabClick: (tabId: string) => void;
  onTabClose: (tabId: string) => void;
  onNewTab: () => void;
  onTabContextMenu: (tabId: string, event: React.MouseEvent) => void;
}

export default function TabBar({
  tabs,
  activeTabId,
  onTabClick,
  onTabClose,
  onNewTab,
  onTabContextMenu,
}: TabBarProps) {
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
      // TODO: Implement tab reordering in Task 5
      console.log('Reorder tabs:', draggedTabId, targetTabId);
    }
    setDraggedTabId(null);
  };

  const getFavicon = (tab: Tab) => {
    return tab.favicon || <Globe size={16} />;
  };

  const getTabTitle = (tab: Tab) => {
    if (tab.loading) return t('tabs.loading');
    return tab.title || t('tabs.untitled');
  };

  return (
    <div className="tab-bar">
      <div className="tabs-container">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`tab ${tab.id === activeTabId ? 'active' : ''} ${
              tab.isPinned ? 'pinned' : ''
            } ${draggedTabId === tab.id ? 'dragging' : ''}`}
            onClick={() => onTabClick(tab.id)}
            onContextMenu={(e) => onTabContextMenu(tab.id, e)}
            draggable
            onDragStart={() => handleDragStart(tab.id)}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(tab.id)}
          >
            <span className="tab-favicon">{getFavicon(tab)}</span>
            {!tab.isPinned && (
              <span className="tab-title" title={tab.title}>
                {getTabTitle(tab)}
              </span>
            )}
            {tab.isMuted && <span className="tab-muted"><VolumeX size={14} /></span>}
            {tab.loading && <span className="tab-loading"><Loader2 size={14} /></span>}
            <button
              className="tab-close"
              onClick={(e) => {
                e.stopPropagation();
                onTabClose(tab.id);
              }}
              title={t('tabs.closeTab')}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <button className="new-tab-button" onClick={onNewTab} title={t('tabs.newTab')}>
        <Plus size={20} />
      </button>

      <style>{`
        .tab-bar {
          display: flex;
          align-items: center;
          background: #f5f5f5;
          border-bottom: 1px solid #ddd;
          height: 40px;
          user-select: none;
        }

        .tabs-container {
          display: flex;
          flex: 1;
          overflow-x: auto;
          overflow-y: hidden;
          scrollbar-width: thin;
        }

        .tabs-container::-webkit-scrollbar {
          height: 4px;
        }

        .tabs-container::-webkit-scrollbar-thumb {
          background: #ccc;
          border-radius: 2px;
        }

        .tab {
          display: flex;
          align-items: center;
          gap: 6px;
          min-width: 180px;
          max-width: 240px;
          height: 100%;
          padding: 0 12px;
          background: #e0e0e0;
          border-right: 1px solid #ccc;
          cursor: pointer;
          transition: background 0.2s;
          position: relative;
        }

        .tab.pinned {
          min-width: 40px;
          max-width: 40px;
          justify-content: center;
        }

        .tab:hover {
          background: #d5d5d5;
        }

        .tab.active {
          background: #fff;
          border-bottom: 2px solid #4a90e2;
        }

        .tab.dragging {
          opacity: 0.5;
        }

        .tab-favicon {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          color: #666;
        }

        .tab-title {
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-size: 13px;
        }

        .tab-muted {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          color: #999;
        }

        .tab-loading {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          color: #4a90e2;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .tab-close {
          display: none;
          width: 20px;
          height: 20px;
          border: none;
          background: transparent;
          border-radius: 4px;
          cursor: pointer;
          font-size: 18px;
          line-height: 1;
          padding: 0;
          color: #666;
          flex-shrink: 0;
        }

        .tab:hover .tab-close {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .tab-close:hover {
          background: rgba(0, 0, 0, 0.1);
          color: #000;
        }

        .new-tab-button {
          width: 36px;
          height: 36px;
          margin: 0 4px;
          border: none;
          background: transparent;
          border-radius: 4px;
          cursor: pointer;
          color: #666;
          transition: background 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .new-tab-button:hover {
          background: rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
}
