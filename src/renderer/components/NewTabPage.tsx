import { useState } from 'react';
import { useTranslation } from '../contexts/I18nContext';
import { Search, Building2, BookOpen, Briefcase, Newspaper, GraduationCap, Flag, ArrowRight } from 'lucide-react';
import styles from './NewTabPage.module.css';

interface QuickLink {
  id: string;
  title: string;
  url: string;
  icon: string;
  category: 'government' | 'education' | 'news' | 'business';
}

interface NewTabPageProps {
  onSearch: (query: string) => void;
  onNavigate: (url: string) => void;
}

export default function NewTabPage({ onSearch, onNavigate }: NewTabPageProps) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');

  // Default Rwandan quick links
  const quickLinks: QuickLink[] = [
    {
      id: '1',
      title: 'Irembo',
      url: 'https://irembo.gov.rw',
      icon: 'building',
      category: 'government',
    },
    {
      id: '2',
      title: 'REB',
      url: 'https://reb.rw',
      icon: 'book',
      category: 'education',
    },
    {
      id: '3',
      title: 'Rwanda Development Board',
      url: 'https://rdb.rw',
      icon: 'briefcase',
      category: 'business',
    },
    {
      id: '4',
      title: 'The New Times',
      url: 'https://newtimes.co.rw',
      icon: 'newspaper',
      category: 'news',
    },
    {
      id: '5',
      title: 'KT Press',
      url: 'https://ktpress.rw',
      icon: 'newspaper',
      category: 'news',
    },
    {
      id: '6',
      title: 'University of Rwanda',
      url: 'https://ur.ac.rw',
      icon: 'graduation',
      category: 'education',
    },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim());
      setSearchQuery('');
    }
  };

  const handleQuickLinkClick = (url: string) => {
    onNavigate(url);
  };

  const getCategoryTitle = (category: string) => {
    switch (category) {
      case 'government':
        return 'Guverinoma'; // Government
      case 'education':
        return 'Uburezi'; // Education
      case 'news':
        return 'Amakuru'; // News
      case 'business':
        return 'Ubucuruzi'; // Business
      default:
        return category;
    }
  };

  const groupedLinks = quickLinks.reduce((acc, link) => {
    if (!acc[link.category]) {
      acc[link.category] = [];
    }
    acc[link.category].push(link);
    return acc;
  }, {} as Record<string, QuickLink[]>);

  const getIconComponent = (iconName: string) => {
    const iconProps = { size: 32 };
    switch (iconName) {
      case 'building': return <Building2 {...iconProps} />;
      case 'book': return <BookOpen {...iconProps} />;
      case 'briefcase': return <Briefcase {...iconProps} />;
      case 'newspaper': return <Newspaper {...iconProps} />;
      case 'graduation': return <GraduationCap {...iconProps} />;
      default: return <Building2 {...iconProps} />;
    }
  };

  return (
    <div className={styles['new-tab-page']}>
      <div className={styles['background-overlay']} />
      <div className={styles['new-tab-content']}>
        <header className={styles['new-tab-header']}>
          <div className={styles['logo-container']}>
            <img src="/assets/logo.svg" alt="Wing Logo" className={styles['logo-icon']} />
          </div>
          <h1 className={styles['new-tab-title']}>
            {t('common.app.name')}
          </h1>
          <p className={styles['new-tab-tagline']}>{t('common.app.tagline')}</p>
        </header>

        <form className={`${styles['search-box']} glass`} onSubmit={handleSearch}>
          <Search size={20} className={styles['search-icon']} />
          <input
            type="text"
            className={styles['search-input']}
            placeholder={t('common.actions.search')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
          <button type="submit" className={styles['search-button']}>
            <ArrowRight size={20} />
          </button>
        </form>

        <div className={styles['content-sections']}>
          {Object.entries(groupedLinks).map(([category, links]) => (
            <section key={category} className={styles['content-section']}>
              <h2 className={styles['section-title']}>{getCategoryTitle(category)}</h2>
              <div className={styles['quick-links']}>
                {links.map((link) => (
                  <button
                    key={link.id}
                    className={`${styles['quick-link']} glass`}
                    onClick={() => handleQuickLinkClick(link.url)}
                  >
                    <div className={styles['quick-link-icon-wrapper']}>
                      {getIconComponent(link.icon)}
                    </div>
                    <span className={styles['quick-link-title']}>{link.title}</span>
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>

        <footer className={styles['new-tab-footer']}>
          <p>Murakoze! <Flag size={16} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: '4px' }} /></p>
        </footer>
      </div>


    </div>
  );
}
