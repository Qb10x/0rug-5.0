// Settings Types - following 0rug.com coding guidelines

// Settings section interface
export interface SettingsSection {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

// Notification settings interface
export interface NotificationSettings {
  email: boolean;
  push: boolean;
  telegram: boolean;
  discord: boolean;
}

// Performance settings interface
export interface PerformanceSettings {
  autoRefresh: number;
  cacheEnabled: boolean;
  dataRetention: number;
}

// Security settings interface
export interface SecuritySettings {
  twoFactorEnabled: boolean;
  sessionTimeout: number;
  apiKeyEnabled: boolean;
}

// Data settings interface
export interface DataSettings {
  exportFormat: string;
  backupEnabled: boolean;
  storageLimit: number;
} 