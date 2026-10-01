import { useState, useEffect } from 'react';

export type ThemeMode = 'light' | 'dark';

export function useThemeMode() {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('coralink_theme') as ThemeMode | null;
        if (stored === 'light' || stored === 'dark') {
          return stored;
        }
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
          return 'dark';
        }
      } catch (e) {
        console.error('Error reading theme from storage:', e);
      }
    }
    return 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem('coralink_theme', theme);
    } catch (e) {
      console.error('Error writing theme to storage:', e);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const isDarkMode = theme === 'dark';

  return {
    theme,
    isDarkMode,
    toggleTheme,
    setTheme,
  };
}
