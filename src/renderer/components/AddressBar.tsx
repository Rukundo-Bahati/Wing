import { useRef } from 'react';
import { useTranslation } from '../contexts/I18nContext';
import { Lock, AlertTriangle, Globe, Loader2, RotateCw } from 'lucide-react';
import styles from './AddressBar.module.css';

interface AddressBarProps {
  url: string;
  onUrlChange: (url: string) => void;
  onNavigate: (url: string) => void;
  onRefresh: () => void;
  isLoading?: boolean;
  isSecure?: boolean;
  hasError?: boolean;
}

export const AddressBar: React.FC<AddressBarProps> = ({
  url,
  onUrlChange,
  onNavigate,
  onRefresh,
  isLoading = false,
  isSecure = false,
  hasError = false,
}) => {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedUrl = url.trim();
    if (trimmedUrl) {
      onNavigate(trimmedUrl);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  const getSecurityIcon = () => {
    if (hasError) return <AlertTriangle size={16} className={styles.error} />;
    if (isSecure) return <Lock size={16} className={styles.secure} />;
    return <Globe size={16} className={styles.insecure} />;
  };

  return (
    <div className={styles.addressBar}>
      <div className={styles.securityIndicator}>
        {getSecurityIcon()}
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          ref={inputRef}
          type="text"
          value={url}
          onChange={(e) => onUrlChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t('addressBar.placeholder')}
          className={styles.input}
          spellCheck={false}
        />
      </form>

      <div className={styles.actions}>
        <button
          type="button"
          onClick={onRefresh}
          className={styles.refreshButton}
          title={t('addressBar.refresh')}
        >
          {isLoading ? <Loader2 size={16} className={styles.spinning} /> : <RotateCw size={16} />}
        </button>
      </div>
    </div>
  );
};
