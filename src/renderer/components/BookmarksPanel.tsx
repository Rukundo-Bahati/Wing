import { useState, useEffect } from 'react';
import { useTranslation } from '../contexts/I18nContext';
import { Globe, Trash2, Building2, BookOpen } from 'lucide-react';

interface Bookmark {
  id: string;
  title: string;
  url: string;
  folderId?: string;
  favicon?: string;
  createdAt: Date;
}

interface BookmarksPanelProps {
  onNavigate: (url: string) => void;
  onClose: () => void;
}

export default function BookmarksPanel({ onNavigate, onClose }: BookmarksPanelProps) {
  const { t } = useTranslation();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingBookmark, setIsAddingBookmark] = useState(false);
  const [newBookmark, setNewBookmark] = useState({ title: '', url: '' });

  useEffect(() => {
    loadBookmarks();
  }, []);

  const loadBookmarks = () => {
    // TODO: Load from storage service via IPC
    // For now, use mock data
    const mockBookmarks: Bookmark[] = [
      {
        id: '1',
        title: 'Irembo',
        url: 'https://irembo.gov.rw',
        favicon: 'building',
        createdAt: new Date(),
      },
      {
        id: '2',
        title: 'REB',
        url: 'https://reb.rw',
        favicon: 'book',
        createdAt: new Date(),
      },
    ];
    setBookmarks(mockBookmarks);
  };

  const handleAddBookmark = () => {
    if (!newBookmark.title || !newBookmark.url) return;

    const bookmark: Bookmark = {
      id: Date.now().toString(),
      title: newBookmark.title,
      url: newBookmark.url,
      favicon: 'globe',
      createdAt: new Date(),
    };

    setBookmarks([bookmark, ...bookmarks]);
    setNewBookmark({ title: '', url: '' });
    setIsAddingBookmark(false);

    // TODO: Save to storage via IPC
  };

  const handleDeleteBookmark = (id: string) => {
    setBookmarks(bookmarks.filter((b) => b.id !== id));
    // TODO: Delete from storage via IPC
  };

  const handleBookmarkClick = (url: string) => {
    onNavigate(url);
    onClose();
  };

  const filteredBookmarks = searchQuery
    ? bookmarks.filter(
        (b) =>
          b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          b.url.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : bookmarks;

  const getFaviconComponent = (iconName: string) => {
    const iconProps = { size: 20 };
    switch (iconName) {
      case 'building': return <Building2 {...iconProps} />;
      case 'book': return <BookOpen {...iconProps} />;
      case 'globe': return <Globe {...iconProps} />;
      default: return <Globe {...iconProps} />;
    }
  };

  return (
    <div className="bookmarks-panel">
      <div className="bookmarks-header">
        <h2>{t('bookmarks.title')}</h2>
        <button className="close-button" onClick={onClose}>
          ×
        </button>
      </div>

      <div className="bookmarks-toolbar">
        <input
          type="text"
          className="search-input"
          placeholder={t('bookmarks.searchBookmarks')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button className="add-button" onClick={() => setIsAddingBookmark(true)}>
          + {t('bookmarks.addBookmark')}
        </button>
      </div>

      {isAddingBookmark && (
        <div className="add-bookmark-form">
          <input
            type="text"
            placeholder={t('bookmarks.bookmarkName')}
            value={newBookmark.title}
            onChange={(e) => setNewBookmark({ ...newBookmark, title: e.target.value })}
          />
          <input
            type="text"
            placeholder={t('bookmarks.bookmarkUrl')}
            value={newBookmark.url}
            onChange={(e) => setNewBookmark({ ...newBookmark, url: e.target.value })}
          />
          <div className="form-actions">
            <button onClick={handleAddBookmark}>{t('common.actions.save')}</button>
            <button onClick={() => setIsAddingBookmark(false)}>{t('common.actions.cancel')}</button>
          </div>
        </div>
      )}

      <div className="bookmarks-list">
        {filteredBookmarks.length === 0 ? (
          <div className="empty-state">{t('bookmarks.noBookmarks')}</div>
        ) : (
          filteredBookmarks.map((bookmark) => (
            <div key={bookmark.id} className="bookmark-item">
              <div className="bookmark-content" onClick={() => handleBookmarkClick(bookmark.url)}>
                <span className="bookmark-favicon">{getFaviconComponent(bookmark.favicon || 'globe')}</span>
                <div className="bookmark-info">
                  <div className="bookmark-title">{bookmark.title}</div>
                  <div className="bookmark-url">{bookmark.url}</div>
                </div>
              </div>
              <button
                className="delete-button"
                onClick={() => handleDeleteBookmark(bookmark.id)}
                title={t('bookmarks.deleteBookmark')}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>

      <style>{`
        .bookmarks-panel {
          position: fixed;
          top: 0;
          right: 0;
          width: 400px;
          height: 100vh;
          background: white;
          box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
          display: flex;
          flex-direction: column;
          z-index: 1000;
        }

        .bookmarks-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          border-bottom: 1px solid #ddd;
        }

        .bookmarks-header h2 {
          margin: 0;
          font-size: 20px;
        }

        .close-button {
          width: 32px;
          height: 32px;
          border: none;
          background: transparent;
          font-size: 24px;
          cursor: pointer;
          border-radius: 4px;
        }

        .close-button:hover {
          background: #f0f0f0;
        }

        .bookmarks-toolbar {
          padding: 12px;
          border-bottom: 1px solid #ddd;
          display: flex;
          gap: 8px;
        }

        .search-input {
          flex: 1;
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }

        .add-button {
          padding: 8px 16px;
          background: #4a90e2;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          white-space: nowrap;
        }

        .add-button:hover {
          background: #357abd;
        }

        .add-bookmark-form {
          padding: 12px;
          background: #f9f9f9;
          border-bottom: 1px solid #ddd;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .add-bookmark-form input {
          padding: 8px 12px;
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
          padding: 8px;
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

        .bookmarks-list {
          flex: 1;
          overflow-y: auto;
          padding: 8px;
        }

        .empty-state {
          text-align: center;
          padding: 40px 20px;
          color: #999;
        }

        .bookmark-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 4px;
          transition: background 0.2s;
        }

        .bookmark-item:hover {
          background: #f5f5f5;
        }

        .bookmark-content {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          min-width: 0;
        }

        .bookmark-favicon {
          flex-shrink: 0;
          color: #667eea;
          display: flex;
          align-items: center;
        }

        .bookmark-info {
          flex: 1;
          min-width: 0;
        }

        .bookmark-title {
          font-weight: 500;
          font-size: 14px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .bookmark-url {
          font-size: 12px;
          color: #666;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .delete-button {
          width: 32px;
          height: 32px;
          border: none;
          background: transparent;
          cursor: pointer;
          border-radius: 4px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #999;
        }

        .delete-button:hover {
          background: #ffe0e0;
          color: #ff4444;
        }
      `}</style>
    </div>
  );
}
