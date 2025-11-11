import { useEffect, useState } from 'react';
import { APP_NAME } from '../../shared/constants';
import { GlobeIcon  } from 'lucide-react';

export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 300);
          return 100;
        }
        return prev + 10;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="splash-screen">
      <div className="splash-content">
        <div className="wing-logo"><GlobeIcon size={120} strokeWidth={1.5} /></div>
        <h1 className="app-name">{APP_NAME}</h1>
        <p className="tagline">Internet mu Kinyarwanda</p>

        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }}></div>
        </div>

        <p className="loading-text">Loading...</p>
      </div>

      <style>{`
        .splash-screen {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .splash-content {
          text-align: center;
          color: white;
        }

        .wing-logo {
          margin-bottom: 24px;
          animation: flutter 2s ease-in-out infinite;
          color: white;
        }

        @keyframes flutter {
          0%, 100% {
            transform: rotate(0deg) scale(1);
          }
          25% {
            transform: rotate(-10deg) scale(1.05);
          }
          75% {
            transform: rotate(10deg) scale(1.05);
          }
        }

        .app-name {
          margin: 0 0 12px 0;
          font-size: 48px;
          font-weight: 700;
          text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }

        .tagline {
          margin: 0 0 48px 0;
          font-size: 24px;
          opacity: 0.9;
        }

        .progress-bar {
          width: 300px;
          height: 4px;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 2px;
          overflow: hidden;
          margin: 0 auto 16px;
        }

        .progress-fill {
          height: 100%;
          background: white;
          border-radius: 2px;
          transition: width 0.3s ease;
        }

        .loading-text {
          margin: 0;
          font-size: 14px;
          opacity: 0.8;
        }
      `}</style>
    </div>
  );
}
