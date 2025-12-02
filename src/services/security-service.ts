import { settingsService } from './settings-service';

export interface CertificateInfo {
  valid: boolean;
  issuer: string;
  subject: string;
  validFrom: Date;
  validTo: Date;
  fingerprint: string;
}

export interface SecurityStatus {
  isSecure: boolean;
  hasValidCertificate: boolean;
  hasMixedContent: boolean;
  hasTrackers: boolean;
  riskLevel: 'safe' | 'warning' | 'dangerous';
}

class SecurityService {
  private blockedTrackers: Set<string> = new Set();
  private safeModeEnabled: boolean = false;

  constructor() {
    this.loadSettings();
  }

  private loadSettings(): void {
    const privacy = settingsService.getSetting('privacy');
    this.safeModeEnabled = privacy.safeMode;
  }

  enforceHTTPS(url: string): string {
    // Skip for internal pages
    if (url.startsWith('wing://') || url.startsWith('about:')) {
      return url;
    }

    // Skip for localhost and IP addresses
    if (url.includes('localhost') || /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(url)) {
      return url;
    }

    // Check if HTTPS-only mode is enabled
    const privacy = settingsService.getSetting('privacy');
    if (!privacy.httpsOnly) {
      return url;
    }

    // Convert HTTP to HTTPS
    if (url.startsWith('http://')) {
      return url.replace('http://', 'https://');
    }

    // Add HTTPS if no protocol
    if (!url.startsWith('https://') && !url.startsWith('http://')) {
      return 'https://' + url;
    }

    return url;
  }

  async checkCertificate(): Promise<CertificateInfo | null> {
    // TODO: Implement certificate checking
    // This would require integration with Electron's certificate verification
    return null;
  }

  blockTracker(url: string): boolean {
    const privacy = settingsService.getSetting('privacy');
    if (!privacy.blockTrackers) {
      return false;
    }

    // Common tracker domains
    const trackerDomains = [
      'google-analytics.com',
      'googletagmanager.com',
      'doubleclick.net',
      'facebook.com/tr',
      'facebook.net',
      'connect.facebook.net',
      'analytics.twitter.com',
      'ads-twitter.com',
      'amazon-adsystem.com',
      'scorecardresearch.com',
      'quantserve.com',
      'hotjar.com',
      'mouseflow.com',
      'crazyegg.com',
    ];

    const shouldBlock = trackerDomains.some((domain) => url.includes(domain));

    if (shouldBlock) {
      this.blockedTrackers.add(url);
    }

    return shouldBlock;
  }

  getBlockedTrackersCount(): number {
    return this.blockedTrackers.size;
  }

  clearBlockedTrackers(): void {
    this.blockedTrackers.clear();
  }

  async scanDownload(filePath: string): Promise<{ safe: boolean; threat?: string }> {
    // TODO: Implement malware scanning
    // For MVP, check file extension
    const dangerousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.vbs', '.js'];
    const ext = filePath.substring(filePath.lastIndexOf('.')).toLowerCase();

    if (dangerousExtensions.includes(ext)) {
      return {
        safe: false,
        threat: 'Potentially dangerous file type',
      };
    }

    return { safe: true };
  }

  getSecurityStatus(url: string): SecurityStatus {
    const isHTTPS = url.startsWith('https://');
    const isInternal = url.startsWith('wing://');

    return {
      isSecure: isHTTPS || isInternal,
      hasValidCertificate: isHTTPS, // Simplified for MVP
      hasMixedContent: false, // TODO: Detect mixed content
      hasTrackers: false, // TODO: Detect trackers on page
      riskLevel: isHTTPS || isInternal ? 'safe' : 'warning',
    };
  }

  enableSafeMode(): void {
    this.safeModeEnabled = true;
    settingsService.updateSetting('privacy', { safeMode: true });
  }

  disableSafeMode(): void {
    this.safeModeEnabled = false;
    settingsService.updateSetting('privacy', { safeMode: false });
  }

  isSafeModeEnabled(): boolean {
    return this.safeModeEnabled;
  }

  shouldBlockContent(_url: string): boolean {
    if (!this.safeModeEnabled) {
      return false;
    }

    // Block known adult content domains
    const blockedDomains: string[] = [
      // Add blocked domains for safe mode
    ];

    return blockedDomains.some((domain) => _url.includes(domain));
  }

  // Content Security Policy
  getCSP(): string {
    return [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self' https:",
      "frame-src 'none'",
    ].join('; ');
  }

  // Validate URL for security
  validateUrl(url: string): { valid: boolean; reason?: string } {
    // Check for javascript: protocol
    if (url.toLowerCase().startsWith('javascript:')) {
      return { valid: false, reason: 'JavaScript URLs are not allowed' };
    }

    // Check for data: protocol with scripts
    if (url.toLowerCase().startsWith('data:') && url.includes('script')) {
      return { valid: false, reason: 'Data URLs with scripts are not allowed' };
    }

    // Check for file: protocol
    if (url.toLowerCase().startsWith('file:')) {
      return { valid: false, reason: 'File URLs are not allowed' };
    }

    return { valid: true };
  }

  // Generate security report
  getSecurityReport(): {
    trackersBlocked: number;
    httpsUpgrades: number;
    safeModeActive: boolean;
  } {
    return {
      trackersBlocked: this.blockedTrackers.size,
      httpsUpgrades: 0, // TODO: Track HTTPS upgrades
      safeModeActive: this.safeModeEnabled,
    };
  }
}

// Singleton instance
export const securityService = new SecurityService();
