// 0rug Platform Color System - Vibrant Theme
// Unified design tokens for consistent theming

export const colors = {
  // Primary Brand Colors (Vibrant Blue/Purple Theme)
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6', // Vibrant Blue
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  
  // Secondary Colors (Purple/Orange Accents)
  secondary: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7', // Vibrant Purple
    600: '#9333ea',
    700: '#7c3aed',
    800: '#6b21a8',
    900: '#581c87',
  },
  
  // Accent Colors (Vibrant Theme)
  accent: {
    blue: '#3b82f6',
    cyan: '#06b6d4',
    teal: '#14b8a6',
    emerald: '#10b981',
    amber: '#f59e0b',
    orange: '#f97316',
    red: '#ef4444',
    pink: '#ec4899',
    purple: '#8b5cf6',
    indigo: '#6366f1',
  },
  
  // Neutral Colors (Dark Theme)
  neutral: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },
  
  // Semantic Colors
  semantic: {
    success: {
      light: '#10b981',
      dark: '#34d399',
    },
    warning: {
      light: '#f59e0b',
      dark: '#fbbf24',
    },
    error: {
      light: '#ef4444',
      dark: '#f87171',
    },
    info: {
      light: '#3b82f6',
      dark: '#60a5fa',
    },
  },
};

// Light Theme - Vibrant Theme
export const lightTheme = {
  // Background Colors
  background: {
    primary: '#ffffff',
    secondary: '#f8fafc',
    tertiary: '#f1f5f9',
    card: '#ffffff',
    modal: 'rgba(255, 255, 255, 0.95)',
    sidebar: '#ffffff',
    gradient: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
  },
  
  // Text Colors
  text: {
    primary: '#0f172a',
    secondary: '#334155',
    tertiary: '#475569',
    muted: '#64748b',
    inverse: '#ffffff',
  },
  
  // Border Colors
  border: {
    primary: '#e2e8f0',
    secondary: '#cbd5e1',
    accent: '#3b82f6', // Vibrant Blue
  },
  
  // Interactive Colors
  interactive: {
    hover: '#f1f5f9',
    active: '#e2e8f0',
    focus: '#3b82f6', // Vibrant Blue
  },
  
  // Shadow Colors
  shadow: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  },
};

// Dark Theme - Vibrant Theme (Matches your screenshots)
export const darkTheme = {
  // Background Colors
  background: {
    primary: '#0f172a', // Dark blue background
    secondary: '#1e293b',
    tertiary: '#334155',
    card: '#1e293b',
    modal: 'rgba(15, 23, 42, 0.95)',
    sidebar: '#1e293b',
    gradient: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
  },
  
  // Text Colors
  text: {
    primary: '#f8fafc',
    secondary: '#e2e8f0',
    tertiary: '#cbd5e1',
    muted: '#94a3b8',
    inverse: '#0f172a',
  },
  
  // Border Colors
  border: {
    primary: '#334155',
    secondary: '#475569',
    accent: '#3b82f6', // Vibrant Blue
  },
  
  // Interactive Colors
  interactive: {
    hover: '#334155',
    active: '#475569',
    focus: '#3b82f6', // Vibrant Blue
  },
  
  // Shadow Colors
  shadow: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.4)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.4)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.4)',
  },
};

// Gradient Presets - Vibrant Theme
export const gradients = {
  primary: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', // Vibrant Blue
  secondary: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)', // Vibrant Purple
  accent: 'linear-gradient(135deg, #3b82f6 0%, #a855f7 100%)', // Blue to Purple
  success: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', // Green
  warning: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', // Orange
  error: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', // Red
  dark: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', // Dark Blue
  light: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)', // Light
};

// Component-specific color mappings - Vibrant Theme
export const componentColors = {
  button: {
    primary: {
      background: colors.primary[500], // Vibrant Blue
      text: '#ffffff',
      hover: colors.primary[600],
    },
    secondary: {
      background: colors.secondary[500], // Vibrant Purple
      text: '#ffffff',
      hover: colors.secondary[600],
    },
    outline: {
      background: 'transparent',
      text: colors.primary[500], // Vibrant Blue
      border: colors.primary[500], // Vibrant Blue
      hover: colors.primary[50],
    },
  },
  
  card: {
    background: 'var(--card-bg)',
    border: 'var(--border-primary)',
    shadow: 'var(--shadow-md)',
  },
  
  input: {
    background: 'var(--input-bg)',
    border: 'var(--border-primary)',
    focus: colors.primary[500], // Vibrant Blue
    text: 'var(--text-primary)',
  },
  
  sidebar: {
    background: 'var(--sidebar-bg)',
    text: 'var(--text-primary)',
    active: colors.primary[500], // Vibrant Blue
    hover: 'var(--interactive-hover)',
  },
};

// CSS Custom Properties for theme switching
export const generateThemeCSS = (theme: 'light' | 'dark') => {
  const currentTheme = theme === 'light' ? lightTheme : darkTheme;
  
  return `
    :root {
      /* Background Colors */
      --bg-primary: ${currentTheme.background.primary};
      --bg-secondary: ${currentTheme.background.secondary};
      --bg-tertiary: ${currentTheme.background.tertiary};
      --bg-card: ${currentTheme.background.card};
      --bg-modal: ${currentTheme.background.modal};
      --bg-sidebar: ${currentTheme.background.sidebar};
      --bg-gradient: ${currentTheme.background.gradient};
      
      /* Text Colors */
      --text-primary: ${currentTheme.text.primary};
      --text-secondary: ${currentTheme.text.secondary};
      --text-tertiary: ${currentTheme.text.tertiary};
      --text-muted: ${currentTheme.text.muted};
      --text-inverse: ${currentTheme.text.inverse};
      
      /* Border Colors */
      --border-primary: ${currentTheme.border.primary};
      --border-secondary: ${currentTheme.border.secondary};
      --border-accent: ${currentTheme.border.accent};
      
      /* Interactive Colors */
      --interactive-hover: ${currentTheme.interactive.hover};
      --interactive-active: ${currentTheme.interactive.active};
      --interactive-focus: ${currentTheme.interactive.focus};
      
      /* Shadow Colors */
      --shadow-sm: ${currentTheme.shadow.sm};
      --shadow-md: ${currentTheme.shadow.md};
      --shadow-lg: ${currentTheme.shadow.lg};
      --shadow-xl: ${currentTheme.shadow.xl};
    }
  `;
}; 