import { useState } from 'react';
import { useTranslation } from '../contexts/I18nContext';
import { Rocket, Keyboard, Lock, HelpCircle } from 'lucide-react';

interface HelpArticle {
  id: string;
  title: string;
  category: string;
  content: string;
}

export default function HelpCenter({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<HelpArticle | null>(null);

  const helpArticles: HelpArticle[] = [
    {
      id: '1',
      title: 'Getting Started with Wing Browser',
      category: 'Basics',
      content: `
        Welcome to Wing Browser! Here's how to get started:
        
        1. Navigate to websites by typing URLs in the address bar
        2. Search the web by typing your query
        3. Create bookmarks by clicking the star icon
        4. Access settings from the menu
        
        Wing Browser is designed to be simple and intuitive.
      `,
    },
    {
      id: '2',
      title: 'Using Kinyarwanda Spellchecker',
      category: 'Features',
      content: `
        Wing Browser includes a built-in Kinyarwanda spellchecker:
        
        1. Type in any text field
        2. Misspelled words will be underlined in red
        3. Right-click on underlined words for suggestions
        4. Click a suggestion to replace the word
        5. Add words to your personal dictionary
        
        The spellchecker helps you write correctly in Kinyarwanda.
      `,
    },
    {
      id: '3',
      title: 'Managing Bookmarks',
      category: 'Basics',
      content: `
        Save and organize your favorite websites:
        
        1. Click the star icon to bookmark a page
        2. Access bookmarks from the toolbar
        3. Search bookmarks by name or URL
        4. Organize bookmarks into folders
        5. Delete bookmarks you no longer need
        
        Bookmarks sync across your devices.
      `,
    },
    {
      id: '4',
      title: 'Privacy Settings',
      category: 'Privacy',
      content: `
        Wing Browser protects your privacy:
        
        1. Trackers are blocked by default
        2. HTTPS-only mode ensures secure connections
        3. Safe Mode filters inappropriate content
        4. Clear browsing data anytime
        5. Use incognito mode for private browsing
        
        Your privacy is our priority.
      `,
    },
    {
      id: '5',
      title: 'Keyboard Shortcuts',
      category: 'Tips',
      content: `
        Work faster with keyboard shortcuts:
        
        Ctrl+T - New tab
        Ctrl+W - Close tab
        Ctrl+R - Reload page
        Ctrl+D - Bookmark page
        Ctrl+H - View history
        Ctrl+Shift+N - Incognito window
        F1 - Help
        
        Learn these shortcuts to browse efficiently.
      `,
    },
  ];

  const filteredArticles = searchQuery
    ? helpArticles.filter(
        (article) =>
          article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          article.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : helpArticles;

  const categories = Array.from(new Set(helpArticles.map((a) => a.category)));

  return (
    <div className="help-center">
      <div className="help-header">
        <h1>Help Center</h1>
        <button className="close-button" onClick={onClose}>
          ×
        </button>
      </div>

      <div className="help-search">
        <input
          type="text"
          placeholder="Search help articles..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="help-content">
        {selectedArticle ? (
          <div className="article-view">
            <button className="back-button" onClick={() => setSelectedArticle(null)}>
              ← Back to articles
            </button>
            <div className="article-category">{selectedArticle.category}</div>
            <h2>{selectedArticle.title}</h2>
            <div className="article-content">
              {selectedArticle.content.split('\n').map((line, index) => (
                <p key={index}>{line}</p>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="quick-links">
              <h3>Quick Links</h3>
              <div className="quick-link-grid">
                <button className="quick-link">
                  <span className="quick-link-icon"><Rocket size={24} /></span>
                  <span>Getting Started</span>
                </button>
                <button className="quick-link">
                  <span className="quick-link-icon"><Keyboard size={24} /></span>
                  <span>Keyboard Shortcuts</span>
                </button>
                <button className="quick-link">
                  <span className="quick-link-icon"><Lock size={24} /></span>
                  <span>Privacy Guide</span>
                </button>
                <button className="quick-link">
                  <span className="quick-link-icon"><HelpCircle size={24} /></span>
                  <span>FAQ</span>
                </button>
              </div>
            </div>

            <div className="articles-section">
              <h3>Help Articles</h3>
              {categories.map((category) => {
                const categoryArticles = filteredArticles.filter((a) => a.category === category);
                if (categoryArticles.length === 0) return null;

                return (
                  <div key={category} className="category-section">
                    <h4>{category}</h4>
                    <div className="articles-list">
                      {categoryArticles.map((article) => (
                        <button
                          key={article.id}
                          className="article-item"
                          onClick={() => setSelectedArticle(article)}
                        >
                          <span className="article-title">{article.title}</span>
                          <span className="article-arrow">→</span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      <style>{`
        .help-center {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: white;
          z-index: 3000;
          display: flex;
          flex-direction: column;
        }

        .help-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid #ddd;
        }

        .help-header h1 {
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

        .help-search {
          padding: 16px 24px;
          border-bottom: 1px solid #ddd;
        }

        .help-search input {
          width: 100%;
          padding: 12px 16px;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 15px;
        }

        .help-content {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
          max-width: 900px;
          margin: 0 auto;
          width: 100%;
        }

        .quick-links {
          margin-bottom: 40px;
        }

        .quick-links h3 {
          margin: 0 0 16px 0;
          font-size: 18px;
        }

        .quick-link-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 12px;
        }

        .quick-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: #f9f9f9;
          border: 1px solid #ddd;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 15px;
        }

        .quick-link:hover {
          background: #f0f0f0;
          border-color: #4a90e2;
        }

        .quick-link-icon {
          color: #667eea;
        }

        .articles-section h3 {
          margin: 0 0 20px 0;
          font-size: 18px;
        }

        .category-section {
          margin-bottom: 32px;
        }

        .category-section h4 {
          margin: 0 0 12px 0;
          font-size: 16px;
          color: #666;
        }

        .articles-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .article-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 16px;
          background: white;
          border: 1px solid #ddd;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
        }

        .article-item:hover {
          background: #f9f9f9;
          border-color: #4a90e2;
        }

        .article-title {
          font-size: 15px;
        }

        .article-arrow {
          color: #999;
          font-size: 18px;
        }

        .article-view {
          max-width: 700px;
        }

        .back-button {
          padding: 8px 16px;
          background: #f0f0f0;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          margin-bottom: 16px;
        }

        .back-button:hover {
          background: #e0e0e0;
        }

        .article-category {
          display: inline-block;
          padding: 4px 12px;
          background: #e8f4ff;
          color: #4a90e2;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 500;
          margin-bottom: 12px;
        }

        .article-view h2 {
          margin: 0 0 24px 0;
          font-size: 28px;
        }

        .article-content {
          line-height: 1.8;
          color: #333;
        }

        .article-content p {
          margin: 0 0 16px 0;
        }
      `}</style>
    </div>
  );
}
