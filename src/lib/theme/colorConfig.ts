// Centralized Color Configuration for 0rug Platform
// Change colors here to update the entire platform

export const platformColors = {
  // Primary Brand Colors
  primary: {
    main: '#00ff88', // Warm Green (Mercury feel)
    light: '#33ff87',
    dark: '#00cc6a',
    contrast: '#0a0a0a', // Dark Black
  },

  // Secondary Brand Colors
  secondary: {
    main: '#ffd700', // Warm Yellow
    light: '#ffe7a0',
    dark: '#e6c200',
    contrast: '#0a0a0a', // Dark Black
  },

  // Status Colors
  status: {
    success: {
      main: '#10b981', // Green
      light: '#34d399',
      dark: '#059669',
      bg: '#d1fae5',
      text: '#065f46',
    },
    warning: {
      main: '#f59e0b', // Yellow
      light: '#fbbf24',
      dark: '#d97706',
      bg: '#fef3c7',
      text: '#92400e',
    },
    error: {
      main: '#ef4444', // Red
      light: '#f87171',
      dark: '#dc2626',
      bg: '#fee2e2',
      text: '#991b1b',
    },
    info: {
      main: '#3b82f6', // Blue
      light: '#60a5fa',
      dark: '#2563eb',
      bg: '#dbeafe',
      text: '#1e40af',
    },
  },

  // Priority Colors
  priority: {
    high: {
      main: '#ef4444', // Red
      light: '#f87171',
      dark: '#dc2626',
      bg: '#fee2e2',
      text: '#991b1b',
    },
    medium: {
      main: '#f59e0b', // Yellow
      light: '#fbbf24',
      dark: '#d97706',
      bg: '#fef3c7',
      text: '#92400e',
    },
    low: {
      main: '#10b981', // Green
      light: '#34d399',
      dark: '#059669',
      bg: '#d1fae5',
      text: '#065f46',
    },
  },

  // Alert Type Colors
  alertType: {
    whale: {
      main: '#3b82f6', // Blue
      light: '#60a5fa',
      dark: '#2563eb',
      bg: '#dbeafe',
      text: '#1e40af',
    },
    swap: {
      main: '#10b981', // Green
      light: '#34d399',
      dark: '#059669',
      bg: '#d1fae5',
      text: '#065f46',
    },
    rug: {
      main: '#ef4444', // Red
      light: '#f87171',
      dark: '#dc2626',
      bg: '#fee2e2',
      text: '#991b1b',
    },
    volume: {
      main: '#f59e0b', // Yellow
      light: '#fbbf24',
      dark: '#d97706',
      bg: '#fef3c7',
      text: '#92400e',
    },
    new_token: {
      main: '#8b5cf6', // Purple
      light: '#a78bfa',
      dark: '#7c3aed',
      bg: '#ede9fe',
      text: '#5b21b6',
    },
    honeypot: {
      main: '#f97316', // Orange
      light: '#fb923c',
      dark: '#ea580c',
      bg: '#fed7aa',
      text: '#9a3412',
    },
  },

  // Risk Level Colors
  riskLevel: {
    low: {
      main: '#10b981', // Green
      light: '#34d399',
      dark: '#059669',
      bg: '#d1fae5',
      text: '#065f46',
    },
    medium: {
      main: '#f59e0b', // Yellow
      light: '#fbbf24',
      dark: '#d97706',
      bg: '#fef3c7',
      text: '#92400e',
    },
    high: {
      main: '#ef4444', // Red
      light: '#f87171',
      dark: '#dc2626',
      bg: '#fee2e2',
      text: '#991b1b',
    },
    critical: {
      main: '#dc2626', // Dark Red
      light: '#f87171',
      dark: '#b91c1c',
      bg: '#fee2e2',
      text: '#991b1b',
    },
  },

  // Background Colors
  background: {
    primary: '#ffffff',
    secondary: '#f8fafc',
    tertiary: '#f1f5f9',
    card: '#ffffff',
    modal: 'rgba(255, 255, 255, 0.95)',
    sidebar: '#ffffff',
  },

  // Text Colors
  text: {
    primary: '#0f172a',
    secondary: '#475569',
    tertiary: '#64748b',
    muted: '#94a3b8',
    inverse: '#ffffff',
  },

  // Border Colors
  border: {
    primary: '#e2e8f0',
    secondary: '#cbd5e1',
    accent: '#00ff88', // Primary color
  },

  // Shadow Colors
  shadow: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  },
};

// Dark theme colors
export const darkPlatformColors = {
  ...platformColors,
  background: {
    primary: '#0f172a',
    secondary: '#1e293b',
    tertiary: '#334155',
    card: '#1e293b',
    modal: 'rgba(15, 23, 42, 0.95)',
    sidebar: '#1e293b',
  },
  text: {
    primary: '#f8fafc',
    secondary: '#cbd5e1',
    tertiary: '#94a3b8',
    muted: '#64748b',
    inverse: '#0f172a',
  },
  border: {
    primary: '#334155',
    secondary: '#475569',
    accent: '#00ff88', // Primary color
  },
};

// Helper function to get color by type and variant
export const getColor = (
  type: keyof typeof platformColors,
  variant: string = 'main',
  theme: 'light' | 'dark' = 'light'
) => {
  const colors = theme === 'light' ? platformColors : darkPlatformColors;
  const colorGroup = colors[type] as any;
  return colorGroup[variant] || colorGroup.main;
};

// Helper function to get Tailwind classes for a color
export const getColorClasses = (
  type: keyof typeof platformColors,
  variant: string = 'main',
  theme: 'light' | 'dark' = 'light'
) => {
  const color = getColor(type, variant, theme);
  
  // Convert hex to Tailwind classes
  const colorMap: Record<string, string> = {
    '#00ff88': 'text-green-500 bg-green-500',
    '#ffd700': 'text-yellow-500 bg-yellow-500',
    '#10b981': 'text-green-500 bg-green-500',
    '#f59e0b': 'text-yellow-500 bg-yellow-500',
    '#ef4444': 'text-red-500 bg-red-500',
    '#3b82f6': 'text-blue-500 bg-blue-500',
    '#8b5cf6': 'text-purple-500 bg-purple-500',
    '#f97316': 'text-orange-500 bg-orange-500',
  };

  return colorMap[color] || 'text-gray-500 bg-gray-500';
}; 