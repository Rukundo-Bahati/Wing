import { useState } from 'react';
import { useTranslation } from '../contexts/I18nContext';
import { GlobeIcon, Search, Building2, BookOpen, Briefcase, Newspaper, GraduationCap, Flag } from 'lucide-react';

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
    <div className="new-tab-page">
      <div className="new-tab-content">
        <header className="new-tab-header">
          <h1 className="new-tab-title">
            <GlobeIcon size={48} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '12px' }} />
            {t('common.app.name')}
          </h1>
          <p className="new-tab-tagline">{t('common.app.tagline')}</p>
        </header>

        <form className="search-box" onSubmit={handleSearch}>
          <input
            type="text"
            className="search-input"
            placeholder={t('common.actions.search')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
          <button type="submit" className="search-button">
            <Search size={20} />
          </button>
        </form>

        <div className="content-sections">
          {Object.entries(groupedLinks).map(([category, links]) => (
            <section key={category} className="content-section">
              <h2 className="section-title">{getCategoryTitle(category)}</h2>
              <div className="quick-links">
                {links.map((link) => (
                  <button
                    key={link.id}
                    className="quick-link"
                    onClick={() => handleQuickLinkClick(link.url)}
                  >
                    <span className="quick-link-icon">{getIconComponent(link.icon)}</span>
                    <span className="quick-link-title">{link.title}</span>
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>

        <footer className="new-tab-footer">
          <p>Murakoze! <Flag size={20} style={{ display: 'inline', verticalAlign: 'middle' }} /></p>
        </footer>
      </div>

      <style>{`
        .new-tab-page {
          width: 100%;
          height: 100%;
          overflow-y: auto;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .new-tab-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 60px 20px;
        }

        .new-tab-header {
          text-align: center;
          margin-bottom: 40px;
          color: white;
        }

        .new-tab-title {
          font-size: 48px;
          font-weight: 700;
          margin: 0 0 10px 0;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .new-tab-tagline {
          font-size: 20px;
          margin: 0;
          opacity: 0.9;
        }

        .search-box {
          display: flex;
          max-width: 600px;
          margin: 0 auto 60px;
          background: white;
          border-radius: 50px;
          padding: 4px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        }

        .search-input {
          flex: 1;
          border: none;
          outline: none;
          padding: 16px 24px;
          font-size: 16px;
          background: transparent;
        }

        .search-button {
          width: 50px;
          height: 50px;
          border: none;
          background: #667eea;
          border-radius: 50%;
          cursor: pointer;
          font-size: 20px;
          transition: transform 0.2s;
        }

        .search-button:hover {
          transform: scale(1.05);
        }

        .content-sections {
          display: grid;
          gap: 40px;
        }

        .content-section {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .section-title {
          font-size: 20px;
          font-weight: 600;
          margin: 0 0 16px 0;
          color: #333;
        }

        .quick-links {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 12px;
        }

        .quick-link {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 20px;
          background: white;
          border: 2px solid #f0f0f0;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
          text-decoration: none;
          color: inherit;
        }

        .quick-link:hover {
          border-color: #667eea;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
        }

        .quick-link-icon {
          color: #667eea;
        }

        .quick-link-title {
          font-size: 14px;
          font-weight: 500;
          text-align: center;
        }

        .new-tab-footer {
          text-align: center;
          margin-top: 60px;
          color: white;
          opacity: 0.8;
          font-size: 18px;
        }

        @media (max-width: 768px) {
          .new-tab-title {
            font-size: 36px;
          }

          .quick-links {
            grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          }
        }
      `}</style>
    </div>
  );
}
