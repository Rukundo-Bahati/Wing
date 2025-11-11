import { useState } from 'react';
import { I18nProvider } from './contexts/I18nContext';
import TabBar from './components/TabBar';
import Toolbar from './components/Toolbar';
import AddressBar from './components/AddressBar';
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
    <div className="browser-window">
      <TabBar
        tabs={tabs}
        activeTabId={activeTabId}
        onTabClick={handleTabClick}
        onTabClose={handleCloseTab}
        onNewTab={handleNewTab}
        onTabContextMenu={handleTabContextMenu}
      />

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
          loading={activeTab?.loading || false}
          securityStatus="unknown"
          onNavigate={handleNavigate}
          onSearch={handleSearch}
        />
      </div>

      <div className="content-area">
        {activeTab?.url === 'wing://newtab' ? (
          <NewTabPage onSearch={handleSearch} onNavigate={handleNavigate} />
        ) : (
          <div className="page-placeholder">
            <p>Page content will be rendered here</p>
            <p>URL: {activeTab?.url}</p>
            <p>(WebView integration in Task 5)</p>
          </div>
        )}
      </div>

      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .browser-window {
          width: 100vw;
          height: 100vh;
          display: flex;
          flex-direction: column;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
        }

        .address-bar-wrapper {
          padding: 8px 12px;
          background: #fff;
          border-bottom: 1px solid #ddd;
        }

        .content-area {
          flex: 1;
          overflow: hidden;
          background: #fff;
        }

        .page-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: #666;
          gap: 10px;
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
