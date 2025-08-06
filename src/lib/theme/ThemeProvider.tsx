'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { generateThemeCSS } from './colors';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark');

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('0rug-theme') as Theme;
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      const initialTheme = savedTheme || systemTheme;
      
      // Set initial theme class on document
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(initialTheme);
      
      setThemeState(initialTheme);
      applyTheme(initialTheme);
    }
  }, []);

  // Apply theme to document
  const applyTheme = (newTheme: Theme) => {
    // Update document class for Tailwind compatibility
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(newTheme);
    
    // Also apply our custom CSS variables
    const css = generateThemeCSS(newTheme);
    
    // Remove existing theme style
    const existingStyle = document.getElementById('theme-style');
    if (existingStyle) {
      existingStyle.remove();
    }
    
    // Add new theme style
    const style = document.createElement('style');
    style.id = 'theme-style';
    style.textContent = css;
    document.head.appendChild(style);
  };

  // Toggle theme
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setThemeState(newTheme);
    localStorage.setItem('0rug-theme', newTheme);
    applyTheme(newTheme);
  };

  // Set specific theme
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('0rug-theme', newTheme);
    applyTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
} 