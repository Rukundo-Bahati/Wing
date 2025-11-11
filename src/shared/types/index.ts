// Shared TypeScript types and interfaces
export interface WindowOptions {
  width: number;
  height: number;
  title: string;
  incognito?: boolean;
  profile?: string;
}

export interface Tab {
  id: string;
  url: string;
  title: string;
  favicon: string;
  loading: boolean;
  canGoBack: boolean;
  canGoForward: boolean;
  isPinned: boolean;
  isMuted: boolean;
}
