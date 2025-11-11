import { useState, useEffect } from 'react';
import { useTranslation } from '../contexts/I18nContext';

interface HistoryEntry {
  id: string;
  url: string;
  title: string;
  visitTime: Date;
  visitCount: number;
}

interface HistoryGroup {
  label: string;
  entries: HistoryEntry[];
}

interface HistoryPanelProps {
  onNavigate: (url: string) => void;
  onClose: () => void;
}

export default function HistoryPanel({ onNavigate, onClose }: HistoryPanelProps) {
  const { t, formatRelativeTime } = useTranslation();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('all');

  useEffect(() => {
    loadHistory();
  }, [selectedTimeRange]);

  const loadHistory = () => {
    // TODO: Load from storage service via IPC
    // For now, use mock data
    const mockHistory: HistoryEntry[] = [
      {
        id: '1',
        url: 'https://irembo.gov.rw',
        title: 'Irembo - Rwanda Online Services',
        visitTime: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
        visitCount: 5,
      },
      {
        id: '2',
        url: 'https://reb.rw',
        title: 'Rwanda Education Board',
        visitTime: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        visitCount: 3,
      },
      {
        id: '3',
        url: 'https://newtimes.co.rw',
        title: 'The New Times Rwanda',
        visitTime: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        visitCount: 10,
      },
    ];
    setHistory(mockHistory);
  };

  const handleClearHistory = () => {
    if (confirm(t('history.clearHistoryConfirm'))) {
      setHistory([]);
      // TODO: Clear from storage via IPC
    }
  };

  const handleDeleteEntry = (id: string) => {
    setHistory(history.filter((h) => h.id !== id));
    // TODO: Delete from storage via IPC
  };

  const handleEntryClick = (url: string) => {
    onNavigate(url);
    onClose();
  };

  const groupHistoryByDate = (entries: HistoryEntry[]): HistoryGroup[] => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const groups: HistoryGroup[] = [
      { label: t('history.today'), entries: [] },
      { label: t('history.yesterday'), entries: [] },
      { label: t('history.lastWeek'), entries: [] },
      { label: t('history.older'), entries: [] },
    ];

    entries.forEach((entry) => {
      const entryDate = new Date(entry.visitTime);
      if (entryDate >= today) {
        groups[0].entries.push(entry);
      } else if (entryDate >= yesterday) {
        groups[1].entries.push(entry);
      } else if (entryDate >= lastWeek) {
        groups[2].entries.push(entry);
      } else {
        groups[3].entries.push(entry);
      }
    });

    return groups.filter((group) => group.entries.length > 0);
  };

  const filteredHistory = searchQuery
    ? history.filter(
        (h) =>
          h.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          h.url.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : history;

  const groupedHistory = groupHistoryByDate(filteredHistory);

  return (
    <div className="history-panel">
      <div className="history-header">
        <h2>{t('history.title')}</h2>
        <button className="close-button" onClick={onClose}>
          ×
        </button>
      </div>

      <div className="history-toolbar">
        <input
          type="text"
          className="search-input"
          placeholder={t('history.searchHistory')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button className="clear-button" onClick={handleClearHistory}>
          {t('history.clearHistory')}
        </button>
      </div>

      <div className="time-range-filter">
        {(['all', 'day', 'week', 'month'] as const).map((range) => (
          <button
            key={range}
            className={`filter-button ${selectedTimeRange === range ? 'active' : ''}`}
            onClick={() => setSelectedTimeRange(range)}
          >
            {t(`history.timeRange.${range}`)}
          </button>
        ))}
      </div>

      <div className="history-list">
        {filteredHistory.length === 0 ? (
          <div className="empty-state">{t('history.noHistory')}</div>
        ) : (
          groupedHistory.map((group) => (
            <div key={group.label} className="history-group">
              <div className="group-label">{group.label}</div>
              {group.entries.map((entry) => (
                <div key={entry.id} className="history-item">
                  <div className="history-content" onClick={() => handleEntryClick(entry.url)}>
                    <div className="history-info">
                      <div className="history-title">{entry.title}</div>
                      <div className="history-url">{entry.url}</div>
                      <div className="history-meta">
                        {formatRelativeTime(entry.visitTime)} •{' '}
                        {t('history.visitCount', { count: entry.visitCount })}
                      </div>
                    </div>
                  </div>
                  <button
                    className="delete-button"
                    onClick={() => handleDeleteEntry(entry.id)}
                    title={t('common.actions.delete')}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          ))
        )}
      </div>

      <style>{`
        .history-panel {
          position: fixed;
          top: 0;
          right: 0;
          width: 450px;
          height: 100vh;
          background: white;
          box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
          display: flex;
          flex-direction: column;
          z-index: 1000;
        }

        .history-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          border-bottom: 1px solid #ddd;
        }

        .history-header h2 {
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

        .history-toolbar {
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

        .clear-button {
          padding: 8px 16px;
          background: #ff4444;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          white-space: nowrap;
        }

        .clear-button:hover {
          background: #cc0000;
        }

        .time-range-filter {
          display: flex;
          padding: 8px 12px;
          gap: 4px;
          border-bottom: 1px solid #ddd;
          overflow-x: auto;
        }

        .filter-button {
          padding: 6px 12px;
          border: 1px solid #ddd;
          background: white;
          border-radius: 4px;
          cursor: pointer;
          font-size: 13px;
          white-space: nowrap;
          transition: all 0.2s;
        }

        .filter-button:hover {
          background: #f5f5f5;
        }

        .filter-button.active {
          background: #4a90e2;
          color: white;
          border-color: #4a90e2;
        }

        .history-list {
          flex: 1;
          overflow-y: auto;
          padding: 8px;
        }

        .empty-state {
          text-align: center;
          padding: 40px 20px;
          color: #999;
        }

        .history-group {
          margin-bottom: 24px;
        }

        .group-label {
          font-weight: 600;
          font-size: 14px;
          color: #666;
          padding: 8px 12px;
          background: #f9f9f9;
          border-radius: 4px;
          margin-bottom: 8px;
        }

        .history-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 4px;
          transition: background 0.2s;
        }

        .history-item:hover {
          background: #f5f5f5;
        }

        .history-content {
          flex: 1;
          cursor: pointer;
          min-width: 0;
        }

        .history-info {
          min-width: 0;
        }

        .history-title {
          font-weight: 500;
          font-size: 14px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          margin-bottom: 4px;
        }

        .history-url {
          font-size: 12px;
          color: #4a90e2;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          margin-bottom: 4px;
        }

        .history-meta {
          font-size: 11px;
          color: #999;
        }

        .delete-button {
          width: 28px;
          height: 28px;
          border: none;
          background: transparent;
          cursor: pointer;
          border-radius: 4px;
          font-size: 20px;
          flex-shrink: 0;
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
