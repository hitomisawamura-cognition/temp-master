import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { ThemeContext } from './ThemeContext';
import { applyTheme, getStoredTheme, getSystemTheme, storeTheme, type ThemeId } from './themes';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>(() => {
    const initial = getStoredTheme() ?? getSystemTheme();
    applyTheme(initial);
    return initial;
  });

  // Follow OS changes until the user picks a theme explicitly.
  useEffect(() => {
    if (!window.matchMedia) return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      if (getStoredTheme()) return;
      const next = getSystemTheme();
      applyTheme(next);
      setThemeState(next);
    };
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  const value = useMemo(
    () => ({
      theme,
      setTheme: (next: ThemeId) => {
        // Apply before re-render so components reading CSS variables see the new theme.
        applyTheme(next);
        storeTheme(next);
        setThemeState(next);
      },
    }),
    [theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
