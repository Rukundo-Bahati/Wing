import { useEffect, useState } from 'react';
import { Check, X, AlertTriangle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  message: string;
  type: ToastType;
  duration?: number;
  onClose: () => void;
}

export default function Toast({ message, type, duration = 3000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for fade out animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getIcon = () => {
    const iconProps = { size: 20 };
    switch (type) {
      case 'success':
        return <Check {...iconProps} />;
      case 'error':
        return <X {...iconProps} />;
      case 'warning':
        return <AlertTriangle {...iconProps} />;
      case 'info':
        return <Info {...iconProps} />;
    }
  };

  const getColor = () => {
    switch (type) {
      case 'success':
        return '#4caf50';
      case 'error':
        return '#f44336';
      case 'warning':
        return '#ff9800';
      case 'info':
        return '#2196f3';
    }
  };

  return (
    <div className={`toast ${isVisible ? 'visible' : 'hidden'}`} style={{ borderLeftColor: getColor() }}>
      <span className="toast-icon" style={{ color: getColor() }}>
        {getIcon()}
      </span>
      <span className="toast-message">{message}</span>
      <button className="toast-close" onClick={() => setIsVisible(false)}>
        ×
      </button>

      <style>{`
        .toast {
          position: fixed;
          bottom: 24px;
          right: 24px;
          background: white;
          padding: 16px 20px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 300px;
          max-width: 500px;
          border-left: 4px solid;
          z-index: 10000;
          transition: all 0.3s ease;
        }

        .toast.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .toast.hidden {
          opacity: 0;
          transform: translateY(20px);
        }

        .toast-icon {
          flex-shrink: 0;
          display: flex;
          align-items: center;
        }

        .toast-message {
          flex: 1;
          font-size: 14px;
          color: #333;
        }

        .toast-close {
          width: 24px;
          height: 24px;
          border: none;
          background: transparent;
          font-size: 20px;
          cursor: pointer;
          color: #999;
          border-radius: 4px;
          flex-shrink: 0;
        }

        .toast-close:hover {
          background: #f0f0f0;
          color: #333;
        }
      `}</style>
    </div>
  );
}

// Toast container for managing multiple toasts
interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

export function ToastContainer({ toasts, onRemove }: { toasts: ToastMessage[]; onRemove: (id: string) => void }) {
  return (
    <>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => onRemove(toast.id)}
        />
      ))}
    </>
  );
}
