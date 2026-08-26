import { useCallback, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';

function getInitialTheme(): Theme {
  try {
    const stored = window.localStorage.getItem('theme');
    if (stored === 'dark' || stored === 'light') {
      return stored;
    }
  } catch {
    // Private browsing can deny localStorage access.
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function useTheme(): [Theme, () => void] {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      window.localStorage.setItem('theme', theme);
    } catch {
      // Continue without persistence when storage is unavailable.
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'));
  }, []);

  return [theme, toggleTheme];
}
