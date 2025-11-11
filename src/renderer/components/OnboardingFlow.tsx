import { useState } from 'react';
import { useTranslation } from '../contexts/I18nContext';
import {  MessageCircle, Lock, Flag, Globe, Search, Shield, Check, BookOpen, LucideGlobe } from 'lucide-react';

interface OnboardingFlowProps {
  onComplete: () => void;
}

export default function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const { t, locale, setLocale } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState(locale);
  const [privacySettings, setPrivacySettings] = useState({
    blockTrackers: true,
    httpsOnly: true,
    safeMode: false,
  });

  const steps = [
    {
      id: 'welcome',
      title: 'Murakaza neza kuri Wing Browser!',
      subtitle: 'Welcome to Wing Browser!',
      description: "Rwanda's first browser in Kinyarwanda",
    },
    {
      id: 'language',
      title: 'Hitamo ururimi',
      subtitle: 'Choose your language',
      description: 'Select your preferred language for the browser',
    },
    {
      id: 'privacy',
      title: 'Ibanga ryawe',
      subtitle: 'Your privacy',
      description: 'Configure your privacy settings',
    },
    {
      id: 'features',
      title: 'Ibiranga Wing',
      subtitle: 'Wing Features',
      description: 'Discover what makes Wing special',
    },
    {
      id: 'ready',
      title: 'Byose byateguwe!',
      subtitle: "You're all set!",
      description: 'Start browsing in Kinyarwanda',
    },
  ];

  const handleNext = async () => {
    if (currentStep === 1) {
      // Apply language selection
      await setLocale(selectedLanguage);
    }

    if (currentStep === 2) {
      // Save privacy settings
      // TODO: Save via settings service
      console.log('Privacy settings:', privacySettings);
    }

    if (currentStep === steps.length - 1) {
      // Mark onboarding as complete
      localStorage.setItem('onboarding_completed', 'true');
      onComplete();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSkip = () => {
    localStorage.setItem('onboarding_completed', 'true');
    onComplete();
  };

  const renderStepContent = () => {
    const step = steps[currentStep];

    switch (step.id) {
      case 'welcome':
        return (
          <div className="step-content">
            <div className="welcome-logo"><LucideGlobe size={100} strokeWidth={1.5} /></div>
            <h1>{step.title}</h1>
            <h2>{step.subtitle}</h2>
            <p className="description">{step.description}</p>
            <div className="features-preview">
              <div className="feature-badge"><MessageCircle size={16} /> Kinyarwanda</div>
              <div className="feature-badge"><Lock size={16} /> Private</div>
              <div className="feature-badge"><Flag size={16} /> Rwandan</div>
            </div>
          </div>
        );

      case 'language':
        return (
          <div className="step-content">
            <h1>{step.title}</h1>
            <h2>{step.subtitle}</h2>
            <p className="description">{step.description}</p>
            <div className="language-options">
              <button
                className={`language-option ${selectedLanguage === 'rw' ? 'selected' : ''}`}
                onClick={() => setSelectedLanguage('rw')}
              >
                <span className="language-flag"><Flag size={32} /></span>
                <span className="language-name">Kinyarwanda</span>
                <span className="language-native">Ikinyarwanda</span>
              </button>
              <button
                className={`language-option ${selectedLanguage === 'en' ? 'selected' : ''}`}
                onClick={() => setSelectedLanguage('en')}
              >
                <span className="language-flag"><Globe size={32} /></span>
                <span className="language-name">English</span>
                <span className="language-native">English</span>
              </button>
            </div>
          </div>
        );

      case 'privacy':
        return (
          <div className="step-content">
            <h1>{step.title}</h1>
            <h2>{step.subtitle}</h2>
            <p className="description">{step.description}</p>
            <div className="privacy-options">
              <label className="privacy-option">
                <input
                  type="checkbox"
                  checked={privacySettings.blockTrackers}
                  onChange={(e) =>
                    setPrivacySettings({ ...privacySettings, blockTrackers: e.target.checked })
                  }
                />
                <div>
                  <strong>Block trackers</strong>
                  <p>Prevent websites from tracking your activity</p>
                </div>
              </label>
              <label className="privacy-option">
                <input
                  type="checkbox"
                  checked={privacySettings.httpsOnly}
                  onChange={(e) =>
                    setPrivacySettings({ ...privacySettings, httpsOnly: e.target.checked })
                  }
                />
                <div>
                  <strong>HTTPS only</strong>
                  <p>Always use secure connections</p>
                </div>
              </label>
              <label className="privacy-option">
                <input
                  type="checkbox"
                  checked={privacySettings.safeMode}
                  onChange={(e) =>
                    setPrivacySettings({ ...privacySettings, safeMode: e.target.checked })
                  }
                />
                <div>
                  <strong>Safe Mode</strong>
                  <p>Filter inappropriate content (recommended for families)</p>
                </div>
              </label>
            </div>
          </div>
        );

      case 'features':
        return (
          <div className="step-content">
            <h1>{step.title}</h1>
            <h2>{step.subtitle}</h2>
            <div className="features-list">
              <div className="feature-item">
                <div className="feature-icon"><BookOpen size={32} /></div>
                <div>
                  <strong>Kinyarwanda Spellchecker</strong>
                  <p>Write correctly in your language</p>
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-icon"><Globe size={32} /></div>
                <div>
                  <strong>Rwandan Content Hub</strong>
                  <p>Quick access to Irembo, REB, and local news</p>
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-icon"><Search size={32} /></div>
                <div>
                  <strong>Localized Search</strong>
                  <p>Find Rwandan content easily</p>
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-icon"><Shield size={32} /></div>
                <div>
                  <strong>Privacy First</strong>
                  <p>Your data stays with you</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'ready':
        return (
          <div className="step-content">
            <div className="success-icon"><Check size={48} /></div>
            <h1>{step.title}</h1>
            <h2>{step.subtitle}</h2>
            <p className="description">{step.description}</p>
            <div className="ready-message">
              <p>Wing Browser is ready to use</p>
              <p>Murakoze! <Flag size={20} style={{ display: 'inline', verticalAlign: 'middle' }} /></p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="onboarding-flow">
      <div className="onboarding-container">
        <div className="onboarding-progress">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`progress-dot ${index === currentStep ? 'active' : ''} ${
                index < currentStep ? 'completed' : ''
              }`}
            />
          ))}
        </div>

        <div className="onboarding-content">{renderStepContent()}</div>

        <div className="onboarding-actions">
          {currentStep > 0 && currentStep < steps.length - 1 && (
            <button className="skip-button" onClick={handleSkip}>
              Skip
            </button>
          )}
          <button className="next-button" onClick={handleNext}>
            {currentStep === steps.length - 1 ? 'Start Browsing' : 'Next'}
          </button>
        </div>
      </div>

      <style>{`
        .onboarding-flow {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
        }

        .onboarding-container {
          background: white;
          border-radius: 20px;
          padding: 48px;
          max-width: 600px;
          width: 90%;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        .onboarding-progress {
          display: flex;
          justify-content: center;
          gap: 12px;
          margin-bottom: 40px;
        }

        .progress-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #ddd;
          transition: all 0.3s ease;
        }

        .progress-dot.active {
          background: #4a90e2;
          transform: scale(1.3);
        }

        .progress-dot.completed {
          background: #4caf50;
        }

        .onboarding-content {
          min-height: 400px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .step-content {
          text-align: center;
          width: 100%;
        }

        .welcome-logo {
          margin-bottom: 24px;
          animation: flutter 2s ease-in-out infinite;
          color: #667eea;
        }

        @keyframes flutter {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-10deg); }
          75% { transform: rotate(10deg); }
        }

        .step-content h1 {
          margin: 0 0 8px 0;
          font-size: 32px;
          color: #333;
        }

        .step-content h2 {
          margin: 0 0 16px 0;
          font-size: 20px;
          color: #666;
          font-weight: 400;
        }

        .description {
          margin: 0 0 32px 0;
          color: #666;
          font-size: 16px;
        }

        .features-preview {
          display: flex;
          justify-content: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .feature-badge {
          padding: 8px 16px;
          background: #f0f0f0;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .language-options {
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-width: 400px;
          margin: 0 auto;
        }

        .language-option {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
          background: #f9f9f9;
          border: 2px solid #ddd;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
        }

        .language-option:hover {
          background: #f0f0f0;
        }

        .language-option.selected {
          background: #e8f4ff;
          border-color: #4a90e2;
        }

        .language-flag {
          color: #667eea;
        }

        .language-name {
          flex: 1;
          font-weight: 600;
          font-size: 18px;
        }

        .language-native {
          color: #666;
          font-size: 14px;
        }

        .privacy-options {
          display: flex;
          flex-direction: column;
          gap: 16px;
          max-width: 500px;
          margin: 0 auto;
          text-align: left;
        }

        .privacy-option {
          display: flex;
          gap: 16px;
          padding: 16px;
          background: #f9f9f9;
          border-radius: 8px;
          cursor: pointer;
        }

        .privacy-option input[type="checkbox"] {
          width: 20px;
          height: 20px;
          cursor: pointer;
          flex-shrink: 0;
        }

        .privacy-option strong {
          display: block;
          margin-bottom: 4px;
          font-size: 16px;
        }

        .privacy-option p {
          margin: 0;
          font-size: 14px;
          color: #666;
        }

        .features-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
          max-width: 500px;
          margin: 0 auto;
          text-align: left;
        }

        .feature-item {
          display: flex;
          gap: 16px;
          align-items: flex-start;
        }

        .feature-icon {
          flex-shrink: 0;
          color: #667eea;
        }

        .feature-item strong {
          display: block;
          margin-bottom: 4px;
          font-size: 16px;
        }

        .feature-item p {
          margin: 0;
          font-size: 14px;
          color: #666;
        }

        .success-icon {
          width: 80px;
          height: 80px;
          background: #4caf50;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 48px;
          margin: 0 auto 24px;
        }

        .ready-message {
          margin-top: 32px;
        }

        .ready-message p {
          margin: 8px 0;
          font-size: 18px;
          font-weight: 500;
        }

        .onboarding-actions {
          display: flex;
          justify-content: center;
          gap: 12px;
          margin-top: 40px;
        }

        .skip-button {
          padding: 12px 24px;
          background: transparent;
          border: 1px solid #ddd;
          border-radius: 8px;
          cursor: pointer;
          font-size: 16px;
          font-weight: 500;
        }

        .skip-button:hover {
          background: #f0f0f0;
        }

        .next-button {
          padding: 12px 32px;
          background: #4a90e2;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 16px;
          font-weight: 500;
        }

        .next-button:hover {
          background: #357abd;
        }
      `}</style>
    </div>
  );
}
