// 0rug Platform Color System - Mercury Inspired
// Unified design tokens for consistent theming

export const colors = {
  // Mercury Warm Colors
  mercury: {
    // Warm Black (Mercury feel) - Dark theme background
    warmBlack: '#1a1a1a',
    // Warm Green (Mercury feel) - Dark theme CTAs
    warmGreen: '#00ff88',
    // Dark Black (Mercury/electric feel) - Dark theme font
    darkBlack: '#0a0a0a',
    // Warm Grey (Mercury feel) - Light theme background
    warmGrey: '#f5f5f5',
    // Warm Yellow - Light theme CTAs
    warmYellow: '#ffd700',
  },
  
  // Primary Brand Colors (Mercury-inspired)
  primary: {
    50: '#e6fff0',
    100: '#ccffe1',
    200: '#99ffc3',
    300: '#66ffa5',
    400: '#33ff87',
    500: '#00ff88', // Warm Green
    600: '#00cc6a',
    700: '#00994c',
    800: '#00662e',
    900: '#003310',
  },
  
  // Secondary Colors (Warm Yellow for CTAs)
  secondary: {
    50: '#fffbf0',
    100: '#fff7e0',
    200: '#ffefc0',
    300: '#ffe7a0',
    400: '#ffdf80',
    500: '#ffd700', // Warm Yellow
    600: '#e6c200',
    700: '#ccad00',
    800: '#b39800',
    900: '#998300',
  },
  
  // Accent Colors
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
  
  // Neutral Colors
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

// Light Theme - Mercury Inspired
export const lightTheme = {
  // Background Colors
  background: {
    primary: '#f5f5f5', // Warm Grey (Mercury feel)
    secondary: '#e8e8e8',
    tertiary: '#dcdcdc',
    card: '#ffffff',
    modal: 'rgba(255, 255, 255, 0.95)',
    sidebar: '#ffffff',
    gradient: 'linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)',
  },
  
  // Text Colors
  text: {
    primary: '#0a0a0a', // Dark Black (Mercury/electric feel)
    secondary: '#1a1a1a',
    tertiary: '#2a2a2a',
    muted: '#666666',
    inverse: '#ffffff',
  },
  
  // Border Colors
  border: {
    primary: '#d0d0d0',
    secondary: '#c0c0c0',
    accent: '#ffd700', // Warm Yellow
  },
  
  // Interactive Colors
  interactive: {
    hover: '#e8e8e8',
    active: '#dcdcdc',
    focus: '#ffd700', // Warm Yellow
  },
  
  // Shadow Colors
  shadow: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  },
};

// Dark Theme - Mercury Inspired
export const darkTheme = {
  // Background Colors
  background: {
    primary: '#1a1a1a', // Warm Black (Mercury feel)
    secondary: '#0f0f0f',
    tertiary: '#2a2a2a',
    card: '#0f0f0f',
    modal: 'rgba(10, 10, 10, 0.95)',
    sidebar: '#0f0f0f',
    gradient: 'linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%)',
  },
  
  // Text Colors
  text: {
    primary: '#0a0a0a', // Dark Black (Mercury/electric feel)
    secondary: '#1a1a1a',
    tertiary: '#2a2a2a',
    muted: '#666666',
    inverse: '#ffffff',
  },
  
  // Border Colors
  border: {
    primary: '#333333',
    secondary: '#444444',
    accent: '#00ff88', // Warm Green (Mercury feel)
  },
  
  // Interactive Colors
  interactive: {
    hover: '#2a2a2a',
    active: '#333333',
    focus: '#00ff88', // Warm Green (Mercury feel)
  },
  
  // Shadow Colors
  shadow: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.4)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.4)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.4)',
  },
};

// Gradient Presets - Mercury Inspired
export const gradients = {
  primary: 'linear-gradient(135deg, #00ff88 0%, #00cc6a 100%)', // Warm Green
  secondary: 'linear-gradient(135deg, #ffd700 0%, #e6c200 100%)', // Warm Yellow
  accent: 'linear-gradient(135deg, #00ff88 0%, #ffd700 100%)', // Green to Yellow
  success: 'linear-gradient(135deg, #00ff88 0%, #00cc6a 100%)', // Warm Green
  warning: 'linear-gradient(135deg, #ffd700 0%, #e6c200 100%)', // Warm Yellow
  error: 'linear-gradient(135deg, #ff4444 0%, #cc3333 100%)', // Error Red
  dark: 'linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%)', // Warm Black
  light: 'linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)', // Warm Grey
};

// Component-specific color mappings - Mercury Inspired
export const componentColors = {
  button: {
    primary: {
      background: colors.mercury.warmGreen, // Warm Green for dark theme
      text: '#0a0a0a', // Dark Black
      hover: '#00cc6a',
    },
    secondary: {
      background: colors.mercury.warmYellow, // Warm Yellow for light theme
      text: '#0a0a0a', // Dark Black
      hover: '#e6c200',
    },
    outline: {
      background: 'transparent',
      text: colors.mercury.warmGreen, // Warm Green
      border: colors.mercury.warmGreen, // Warm Green
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
    focus: colors.mercury.warmGreen, // Warm Green
    text: 'var(--text-primary)',
  },
  
  sidebar: {
    background: 'var(--sidebar-bg)',
    text: 'var(--text-primary)',
    active: colors.mercury.warmGreen, // Warm Green
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