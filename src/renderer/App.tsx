import { useState } from 'react';
import { I18nProvider } from './contexts/I18nContext';
import { TabBar } from './components/TabBar';
import Toolbar from './components/Toolbar';
import { AddressBar } from './components/AddressBar';
import NewTabPage from './components/NewTabPage';
import { Tab } from '../shared/types';

function AppContent() {
  const [tabs, setTabs] = useState<Tab[]>([
    {
      id: '1',
      url: 'wing://newtab',
      title: 'New Tab',
      favicon: '🦋',
      loading: false,
      canGoBack: false,
      canGoForward: false,
      isPinned: false,
      isMuted: false,
    },
  ]);
  const [activeTabId, setActiveTabId] = useState('1');

  const activeTab = tabs.find((tab) => tab.id === activeTabId);

  const handleNewTab = () => {
    const newTab: Tab = {
      id: Date.now().toString(),
      url: 'wing://newtab',
      title: 'New Tab',
      favicon: '🦋',
      loading: false,
      canGoBack: false,
      canGoForward: false,
      isPinned: false,
      isMuted: false,
    };
    setTabs([...tabs, newTab]);
    setActiveTabId(newTab.id);
  };

  const handleCloseTab = (tabId: string) => {
    const newTabs = tabs.filter((tab) => tab.id !== tabId);
    if (newTabs.length === 0) {
      handleNewTab();
      return;
    }
    setTabs(newTabs);
    if (activeTabId === tabId) {
      setActiveTabId(newTabs[newTabs.length - 1].id);
    }
  };

  const handleTabClick = (tabId: string) => {
    setActiveTabId(tabId);
  };

  const handleTabContextMenu = (tabId: string, event: React.MouseEvent) => {
    event.preventDefault();
    console.log('Tab context menu:', tabId);
    // TODO: Implement context menu in later tasks
  };

  const handleNavigate = (url: string) => {
    console.log('Navigate to:', url);
    // TODO: Implement navigation in Task 5
    if (activeTab) {
      const updatedTabs = tabs.map((tab) =>
        tab.id === activeTabId ? { ...tab, url, loading: true } : tab
      );
      setTabs(updatedTabs);
    }
  };

  const handleSearch = (query: string) => {
    console.log('Search:', query);
    // TODO: Implement search in Task 8
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    handleNavigate(searchUrl);
  };

  return (
    <div className="app-container">
      <div className="browser-header glass">
        <div className="window-controls-placeholder" /> {/* For draggable region if needed */}
        <TabBar
          tabs={tabs}
          activeTabId={activeTabId}
          onTabClick={handleTabClick}
          onTabClose={handleCloseTab}
          onNewTab={handleNewTab}
          onTabContextMenu={handleTabContextMenu}
        />
        
        <div className="browser-controls">
          <Toolbar
            canGoBack={activeTab?.canGoBack || false}
            canGoForward={activeTab?.canGoForward || false}
            isLoading={activeTab?.loading || false}
            onBack={() => console.log('Back')}
            onForward={() => console.log('Forward')}
            onReload={() => console.log('Reload')}
            onStop={() => console.log('Stop')}
            onHome={() => handleNavigate('wing://newtab')}
            onBookmarks={() => console.log('Bookmarks')}
            onExtensions={() => console.log('Extensions')}
            onSettings={() => console.log('Settings')}
          />
          
          <div className="address-bar-wrapper">
            <AddressBar
              url={activeTab?.url || ''}
              onUrlChange={(url) => {
                // TODO: Implement URL change handling
                console.log('URL changed:', url);
              }}
              onNavigate={handleNavigate}
              onRefresh={() => console.log('Refresh')}
              isLoading={activeTab?.loading || false}
            />
          </div>
        </div>
      </div>

      <main className="content-area">
        {activeTab?.url === 'wing://newtab' ? (
          <NewTabPage onSearch={handleSearch} onNavigate={handleNavigate} />
        ) : (
          <div className="page-placeholder">
            <div className="placeholder-content">
              <div className="placeholder-icon">🦋</div>
              <h2>Page content will be rendered here</h2>
              <p className="url-display">{activeTab?.url}</p>
              <p className="note">(WebView integration in Task 5)</p>
            </div>
          </div>
        )}
      </main>

      <style>{`
        .app-container {
          display: flex;
          flex-direction: column;
          height: 100vh;
          background: var(--bg-app);
        }

        .browser-header {
          display: flex;
          flex-direction: column;
          z-index: 10;
          box-shadow: var(--shadow-sm);
        }

        .browser-controls {
          display: flex;
          align-items: center;
          padding: 8px 12px;
          gap: 12px;
          border-bottom: 1px solid var(--border-light);
        }

        .address-bar-wrapper {
          flex: 1;
          max-width: 800px;
          margin: 0 auto;
        }

        .content-area {
          flex: 1;
          position: relative;
          overflow: hidden;
          background: #fff;
        }

        .page-placeholder {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          background: var(--bg-app);
          color: var(--text-secondary);
        }

        .placeholder-content {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }

        .placeholder-icon {
          font-size: 48px;
          filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1));
        }

        .url-display {
          font-family: monospace;
          background: var(--bg-surface);
          padding: 4px 12px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-light);
        }
      `}</style>
    </div>
  );
}

export default function App() {
  return (
    <I18nProvider>
      <AppContent />
    </I18nProvider>
  );
}
