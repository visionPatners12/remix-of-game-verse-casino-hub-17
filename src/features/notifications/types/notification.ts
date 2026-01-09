// Notification types - Unified from page and settings
export interface NotificationItem {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'bet_win' | 'bet_lose' | 'friend_request' | 'system';
  user?: {
    id: string;
    name: string;
    username: string;
    avatar?: string;
  };
  content: string;
  time: Date;
  read: boolean;
  actionable?: boolean;
  metadata?: {
    betAmount?: number;
    winAmount?: number;
    post?: string;
  };
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  marketing: boolean;
  security: boolean;
  tips: boolean;
}

export interface NotificationFormData {
  settings?: Partial<NotificationSettings>;
}