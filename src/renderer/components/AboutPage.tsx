import { useTranslation } from '../contexts/I18nContext';
import { APP_NAME, APP_VERSION } from '../../shared/constants';
import { Star, MessageCircle, BookOpen, Search, Shield, Globe, Lock, Flag, Heart } from 'lucide-react';

export default function AboutPage({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();

  return (
    <div className="about-page">
      <div className="about-content">
        <button className="close-button" onClick={onClose}>
          ×
        </button>

        <div className="about-header">
          <div className="wing-logo"><Star size={80} strokeWidth={1.5} /></div>
          <h1>{APP_NAME}</h1>
          <p className="version">Version {APP_VERSION}</p>
          <p className="tagline">{t('common.app.tagline')}</p>
        </div>

        <div className="about-section">
          <h2>About Wing Browser</h2>
          <p>
            Wing Browser is Rwanda's first indigenous web browser, designed to make the internet
            accessible to all Rwandans by operating entirely in Kinyarwanda. Built with love in
            Rwanda, for Rwandans.
          </p>
        </div>

        <div className="about-section">
          <h2>Vision</h2>
          <p>
            To make the internet accessible, understandable, and empowering for all Rwandans
            through a web browser that speaks their language and reflects their values.
          </p>
        </div>

        <div className="about-section">
          <h2>Features</h2>
          <ul>
            <li><MessageCircle size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }} /> Full Kinyarwanda localization</li>
            <li><BookOpen size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }} /> Built-in Kinyarwanda spellchecker</li>
            <li><Search size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }} /> Localized search with Rwandan content priority</li>
            <li><Shield size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }} /> Privacy-first with tracker blocking</li>
            <li><Globe size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }} /> Rwandan content hub</li>
            <li><Lock size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }} /> HTTPS-only by default</li>
          </ul>
        </div>

        <div className="about-section">
          <h2>Credits</h2>
          <p>
            <strong>Developed by:</strong> Wing Browser Team
            <br />
            <strong>Built with:</strong> Electron, React, TypeScript
            <br />
            <strong>License:</strong> MIT
          </p>
        </div>

        <div className="about-footer">
          <p>© 2025 Wing Browser. Made with <Heart size={16} style={{ display: 'inline', verticalAlign: 'middle', color: '#ff4444' }} /> in Rwanda <Flag size={16} style={{ display: 'inline', verticalAlign: 'middle' }} /></p>
          <p className="murakoze">Murakoze!</p>
        </div>
      </div>

      <style>{`
        .about-page {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 3000;
          animation: fadeIn 0.2s ease;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .about-content {
          background: white;
          border-radius: 16px;
          max-width: 600px;
          max-height: 80vh;
          overflow-y: auto;
          padding: 40px;
          position: relative;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
          animation: slideUp 0.3s ease;
        }

        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .close-button {
          position: absolute;
          top: 16px;
          right: 16px;
          width: 36px;
          height: 36px;
          border: none;
          background: transparent;
          font-size: 28px;
          cursor: pointer;
          border-radius: 6px;
          color: #666;
        }

        .close-button:hover {
          background: #f0f0f0;
          color: #333;
        }

        .about-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .wing-logo {
          margin-bottom: 16px;
          animation: flutter 3s ease-in-out infinite;
          color: #667eea;
        }

        @keyframes flutter {
          0%, 100% {
            transform: rotate(0deg);
          }
          25% {
            transform: rotate(-5deg);
          }
          75% {
            transform: rotate(5deg);
          }
        }

        .about-header h1 {
          margin: 0 0 8px 0;
          font-size: 32px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .version {
          margin: 0 0 8px 0;
          font-size: 14px;
          color: #666;
        }

        .tagline {
          margin: 0;
          font-size: 18px;
          color: #4a90e2;
          font-weight: 500;
        }

        .about-section {
          margin-bottom: 24px;
        }

        .about-section h2 {
          margin: 0 0 12px 0;
          font-size: 18px;
          color: #333;
        }

        .about-section p {
          margin: 0;
          line-height: 1.6;
          color: #666;
        }

        .about-section ul {
          margin: 0;
          padding-left: 20px;
          line-height: 1.8;
          color: #666;
        }

        .about-section li {
          margin-bottom: 8px;
        }

        .about-footer {
          text-align: center;
          padding-top: 24px;
          border-top: 1px solid #eee;
          margin-top: 32px;
        }

        .about-footer p {
          margin: 8px 0;
          font-size: 14px;
          color: #666;
        }

        .murakoze {
          font-size: 20px;
          font-weight: 600;
          color: #4a90e2;
        }
      `}</style>
    </div>
  );
}
