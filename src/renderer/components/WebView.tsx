import { useEffect, useRef } from 'react';

interface WebViewProps {
  url: string;
  onLoadStart?: () => void;
  onLoadComplete?: (title: string, favicon: string) => void;
  onLoadError?: (error: string) => void;
  onNavigate?: (url: string) => void;
  onTitleUpdate?: (title: string) => void;
  onFaviconUpdate?: (favicon: string) => void;
}

export default function WebView({
  url,
  onLoadStart,
  onLoadComplete,
  onLoadError,
  onNavigate,
  onTitleUpdate,
  onFaviconUpdate,
}: WebViewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!iframeRef.current) return;

    // Handle load start
    onLoadStart?.();

    const iframe = iframeRef.current;

    const handleLoad = () => {
      try {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (iframeDoc) {
          const title = iframeDoc.title || 'Untitled';
          const favicon = extractFavicon(iframeDoc);

          onTitleUpdate?.(title);
          onFaviconUpdate?.(favicon);
          onLoadComplete?.(title, favicon);
        }
      } catch (error) {
        // Cross-origin restrictions
        console.log('Cannot access iframe content (cross-origin)');
        onLoadComplete?.('Page Loaded', '🌐');
      }
    };

    const handleError = () => {
      onLoadError?.('ERR_FAILED');
    };

    iframe.addEventListener('load', handleLoad);
    iframe.addEventListener('error', handleError);

    return () => {
      iframe.removeEventListener('load', handleLoad);
      iframe.removeEventListener('error', handleError);
    };
  }, [url, onLoadStart, onLoadComplete, onLoadError, onTitleUpdate, onFaviconUpdate]);

  const extractFavicon = (doc: Document): string => {
    const iconLink = doc.querySelector('link[rel*="icon"]') as HTMLLinkElement;
    if (iconLink?.href) {
      return iconLink.href;
    }
    return '🌐';
  };

  // For MVP, we'll use iframe. In production, Electron's BrowserView would be better
  // Note: iframe has limitations with cross-origin content
  return (
    <div className="webview-container">
      {url.startsWith('wing://') ? (
        <div className="internal-page">
          <p>Internal page: {url}</p>
        </div>
      ) : (
        <iframe
          ref={iframeRef}
          src={url}
          className="webview-iframe"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
          title="Web Content"
        />
      )}

      <style>{`
        .webview-container {
          width: 100%;
          height: 100%;
          position: relative;
          background: #fff;
        }

        .webview-iframe {
          width: 100%;
          height: 100%;
          border: none;
          display: block;
        }

        .internal-page {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #666;
        }
      `}</style>
    </div>
  );
}
