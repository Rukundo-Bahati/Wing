import { useState, useEffect } from 'react';
import { RefreshCw, PartyPopper, Download, Check } from 'lucide-react';

interface UpdateInfo {
  version: string;
  releaseDate: string;
  releaseNotes: string;
}

interface UpdateProgress {
  percent: number;
  bytesPerSecond: number;
  transferred: number;
  total: number;
}

export default function UpdateNotification() {
  const [updateState, setUpdateState] = useState<
    'checking' | 'available' | 'downloading' | 'downloaded' | 'none'
  >('none');
  const [updateInfo] = useState<UpdateInfo | null>(null);
  const [progress] = useState<UpdateProgress | null>(null);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    // Listen for update events from main process
    if (window.electronAPI) {
      // TODO: Set up IPC listeners for update events
      // window.electronAPI.onUpdateAvailable((info) => { ... })
    }
  }, []);

  const handleDownload = () => {
    setUpdateState('downloading');
    // TODO: Call update service via IPC
    console.log('Start download');
  };

  const handleInstall = () => {
    // TODO: Call update service via IPC to quit and install
    console.log('Install update');
  };

  const handlePostpone = () => {
    setShowNotification(false);
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  if (!showNotification && updateState === 'none') {
    return null;
  }

  return (
    <div className="update-notification">
      {updateState === 'checking' && (
        <div className="update-content">
          <div className="update-icon"><RefreshCw size={32} /></div>
          <div className="update-text">
            <strong>Checking for updates...</strong>
          </div>
        </div>
      )}

      {updateState === 'available' && updateInfo && (
        <div className="update-content">
          <div className="update-icon"><PartyPopper size={32} /></div>
          <div className="update-text">
            <strong>Update Available</strong>
            <p>
              Wing Browser {updateInfo.version} is available
            </p>
            {updateInfo.releaseNotes && (
              <details className="release-notes">
                <summary>What's new</summary>
                <p>{updateInfo.releaseNotes}</p>
              </details>
            )}
          </div>
          <div className="update-actions">
            <button className="update-button primary" onClick={handleDownload}>
              Download
            </button>
            <button className="update-button" onClick={handlePostpone}>
              Later
            </button>
          </div>
        </div>
      )}

      {updateState === 'downloading' && progress && (
        <div className="update-content">
          <div className="update-icon"><Download size={32} /></div>
          <div className="update-text">
            <strong>Downloading Update</strong>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${progress.percent}%` }}
              ></div>
            </div>
            <p className="progress-text">
              {Math.round(progress.percent)}% • {formatBytes(progress.transferred)} /{' '}
              {formatBytes(progress.total)}
            </p>
          </div>
        </div>
      )}

      {updateState === 'downloaded' && updateInfo && (
        <div className="update-content">
          <div className="update-icon"><Check size={32} /></div>
          <div className="update-text">
            <strong>Update Ready</strong>
            <p>
              Wing Browser {updateInfo.version} is ready to install
            </p>
          </div>
          <div className="update-actions">
            <button className="update-button primary" onClick={handleInstall}>
              Restart & Install
            </button>
            <button className="update-button" onClick={handlePostpone}>
              Later
            </button>
          </div>
        </div>
      )}

      <style>{`
        .update-notification {
          position: fixed;
          top: 16px;
          right: 16px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
          padding: 16px;
          max-width: 400px;
          z-index: 9999;
          animation: slideIn 0.3s ease;
        }

        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .update-content {
          display: flex;
          gap: 12px;
          align-items: flex-start;
        }

        .update-icon {
          flex-shrink: 0;
          color: #667eea;
        }

        .update-text {
          flex: 1;
          min-width: 0;
        }

        .update-text strong {
          display: block;
          font-size: 16px;
          margin-bottom: 4px;
        }

        .update-text p {
          margin: 0;
          font-size: 14px;
          color: #666;
        }

        .release-notes {
          margin-top: 8px;
          font-size: 13px;
        }

        .release-notes summary {
          cursor: pointer;
          color: #4a90e2;
          font-weight: 500;
        }

        .release-notes p {
          margin-top: 8px;
          padding: 8px;
          background: #f9f9f9;
          border-radius: 4px;
          font-size: 12px;
          max-height: 150px;
          overflow-y: auto;
        }

        .progress-bar {
          height: 6px;
          background: #e0e0e0;
          border-radius: 3px;
          overflow: hidden;
          margin: 8px 0;
        }

        .progress-fill {
          height: 100%;
          background: #4a90e2;
          border-radius: 3px;
          transition: width 0.3s ease;
        }

        .progress-text {
          font-size: 12px;
          color: #666;
        }

        .update-actions {
          display: flex;
          gap: 8px;
          margin-top: 12px;
        }

        .update-button {
          padding: 8px 16px;
          border: 1px solid #ddd;
          background: white;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s;
        }

        .update-button:hover {
          background: #f5f5f5;
        }

        .update-button.primary {
          background: #4a90e2;
          color: white;
          border-color: #4a90e2;
        }

        .update-button.primary:hover {
          background: #357abd;
        }
      `}</style>
    </div>
  );
}
