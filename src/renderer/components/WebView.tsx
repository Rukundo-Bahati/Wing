import { useEffect, useRef } from 'react';
import styles from './WebView.module.css';

interface WebViewProps {
  src: string;
  onLoad?: () => void;
  onError?: (error: any) => void;
}

export const WebView: React.FC<WebViewProps> = ({ src, onLoad, onError }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleLoad = () => {
      onLoad?.();
    };

    const handleError = (event: Event) => {
      onError?.(event);
    };

    iframe.addEventListener('load', handleLoad);
    iframe.addEventListener('error', handleError);

    return () => {
      iframe.removeEventListener('load', handleLoad);
      iframe.removeEventListener('error', handleError);
    };
  }, [onLoad, onError]);

  return (
    <div className={styles.webviewContainer}>
      <iframe
        ref={iframeRef}
        src={src}
        className={styles.webview}
        title="Web View"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
      />
    </div>
  );
};
