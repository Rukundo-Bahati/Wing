  import { useState, useEffect } from 'react';
import { useTranslation } from '../contexts/I18nContext';
import { Download, File, Folder, FolderOpen, Pause, Play, X, Check } from 'lucide-react';

interface Download {
  id: string;
  filename: string;
  url: string;
  path: string;
  totalBytes: number;
  receivedBytes: number;
  progress: number;
  speed: number;
  state: 'progressing' | 'completed' | 'cancelled' | 'interrupted' | 'paused';
  startTime: Date;
  endTime?: Date;
}

interface DownloadsPanelProps {
  onClose: () => void;
}

export default function DownloadsPanel({ onClose }: DownloadsPanelProps) {
  const { t } = useTranslation();
  const [downloads, setDownloads] = useState<Download[]>([
    // Mock data for demonstration
    {
      id: '1',
      filename: 'document.pdf',
      url: 'https://example.com/document.pdf',
      path: '/downloads/document.pdf',
      totalBytes: 5242880,
      receivedBytes: 5242880,
      progress: 100,
      speed: 0,
      state: 'completed',
      startTime: new Date(Date.now() - 300000),
      endTime: new Date(Date.now() - 240000),
    },
    {
      id: '2',
      filename: 'image.jpg',
      url: 'https://example.com/image.jpg',
      path: '/downloads/image.jpg',
      totalBytes: 2097152,
      receivedBytes: 1048576,
      progress: 50,
      speed: 524288,
      state: 'progressing',
      startTime: new Date(Date.now() - 10000),
    },
  ]);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatSpeed = (bytesPerSecond: number): string => {
    return formatBytes(bytesPerSecond) + '/s';
  };

  const handlePause = (id: string) => {
    setDownloads(
      downloads.map((d) => (d.id === id ? { ...d, state: 'paused' as const } : d))
    );
    // TODO: Call download manager via IPC
  };

  const handleResume = (id: string) => {
    setDownloads(
      downloads.map((d) => (d.id === id ? { ...d, state: 'progressing' as const } : d))
    );
    // TODO: Call download manager via IPC
  };

  const handleCancel = (id: string) => {
    setDownloads(downloads.filter((d) => d.id !== id));
    // TODO: Call download manager via IPC
  };

  const handleOpenFile = (path: string) => {
    console.log('Open file:', path);
    // TODO: Open file via IPC
  };

  const handleShowInFolder = (path: string) => {
    console.log('Show in folder:', path);
    // TODO: Show in folder via IPC
  };

  const handleClearCompleted = () => {
    setDownloads(downloads.filter((d) => d.state !== 'completed'));
    // TODO: Call download manager via IPC
  };

  const activeDownloads = downloads.filter((d) => d.state === 'progressing' || d.state === 'paused');
  const completedDownloads = downloads.filter((d) => d.state === 'completed');

  return (
    <div className="downloads-panel">
      <div className="downloads-header">
        <h2>Downloads</h2>
        <div className="header-actions">
          {completedDownloads.length > 0 && (
            <button className="clear-button" onClick={handleClearCompleted}>
              Clear completed
            </button>
          )}
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>
      </div>

      <div className="downloads-content">
        {downloads.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><Download size={48} /></div>
            <p>No downloads</p>
          </div>
        ) : (
          <>
            {activeDownloads.length > 0 && (
              <div className="downloads-section">
                <h3>Active ({activeDownloads.length})</h3>
                {activeDownloads.map((download) => (
                  <div key={download.id} className="download-item">
                    <div className="download-icon"><File size={24} /></div>
                    <div className="download-info">
                      <div className="download-name">{download.filename}</div>
                      <div className="download-progress-bar">
                        <div
                          className="download-progress-fill"
                          style={{ width: `${download.progress}%` }}
                        ></div>
                      </div>
                      <div className="download-stats">
                        {download.state === 'progressing' ? (
                          <>
                            {formatBytes(download.receivedBytes)} / {formatBytes(download.totalBytes)}
                            {' • '}
                            {formatSpeed(download.speed)}
                            {' • '}
                            {Math.round(download.progress)}%
                          </>
                        ) : (
                          <span>Paused • {Math.round(download.progress)}%</span>
                        )}
                      </div>
                    </div>
                    <div className="download-actions">
                      {download.state === 'progressing' ? (
                        <button
                          className="action-button"
                          onClick={() => handlePause(download.id)}
                          title="Pause"
                        >
                          <Pause size={16} />
                        </button>
                      ) : (
                        <button
                          className="action-button"
                          onClick={() => handleResume(download.id)}
                          title="Resume"
                        >
                          <Play size={16} />
                        </button>
                      )}
                      <button
                        className="action-button"
                        onClick={() => handleCancel(download.id)}
                        title="Cancel"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {completedDownloads.length > 0 && (
              <div className="downloads-section">
                <h3>Completed ({completedDownloads.length})</h3>
                {completedDownloads.map((download) => (
                  <div key={download.id} className="download-item completed">
                    <div className="download-icon"><Check size={24} /></div>
                    <div className="download-info">
                      <div className="download-name">{download.filename}</div>
                      <div className="download-stats">
                        {formatBytes(download.totalBytes)}
                        {download.endTime && (
                          <>
                            {' • '}
                            {new Date(download.endTime).toLocaleTimeString()}
                          </>
                        )}
                      </div>
                    </div>
                    <div className="download-actions">
                      <button
                        className="action-button"
                        onClick={() => handleOpenFile(download.path)}
                        title="Open"
                      >
                        <FolderOpen size={16} />
                      </button>
                      <button
                        className="action-button"
                        onClick={() => handleShowInFolder(download.path)}
                        title="Show in folder"
                      >
                        <Folder size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
        .downloads-panel {
          position: fixed;
          bottom: 0;
          right: 0;
          width: 450px;
          max-height: 500px;
          background: white;
          box-shadow: -2px -2px 12px rgba(0, 0, 0, 0.15);
          border-radius: 12px 12px 0 0;
          display: flex;
          flex-direction: column;
          z-index: 1000;
        }

        .downloads-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          border-bottom: 1px solid #ddd;
        }

        .downloads-header h2 {
          margin: 0;
          font-size: 18px;
        }

        .header-actions {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .clear-button {
          padding: 6px 12px;
          background: #f0f0f0;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 13px;
        }

        .clear-button:hover {
          background: #e0e0e0;
        }

        .close-button {
          width: 28px;
          height: 28px;
          border: none;
          background: transparent;
          font-size: 24px;
          cursor: pointer;
          border-radius: 4px;
        }

        .close-button:hover {
          background: #f0f0f0;
        }

        .downloads-content {
          flex: 1;
          overflow-y: auto;
          padding: 12px;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          color: #999;
        }

        .empty-icon {
          font-size: 48px;
          margin-bottom: 12px;
          opacity: 0.5;
        }

        .downloads-section {
          margin-bottom: 20px;
        }

        .downloads-section h3 {
          margin: 0 0 12px 0;
          font-size: 14px;
          font-weight: 600;
          color: #666;
        }

        .download-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: #f9f9f9;
          border-radius: 8px;
          margin-bottom: 8px;
        }

        .download-item.completed {
          background: #f0f9f0;
        }

        .download-icon {
          flex-shrink: 0;
          color: #667eea;
        }

        .download-info {
          flex: 1;
          min-width: 0;
        }

        .download-name {
          font-weight: 500;
          font-size: 14px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          margin-bottom: 6px;
        }

        .download-progress-bar {
          height: 4px;
          background: #e0e0e0;
          border-radius: 2px;
          overflow: hidden;
          margin-bottom: 6px;
        }

        .download-progress-fill {
          height: 100%;
          background: #4a90e2;
          border-radius: 2px;
          transition: width 0.3s ease;
        }

        .download-stats {
          font-size: 12px;
          color: #666;
        }

        .download-actions {
          display: flex;
          gap: 4px;
          flex-shrink: 0;
        }

        .action-button {
          width: 32px;
          height: 32px;
          border: none;
          background: white;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .action-button:hover {
          background: #e8e8e8;
        }
      `}</style>
    </div>
  );
}
