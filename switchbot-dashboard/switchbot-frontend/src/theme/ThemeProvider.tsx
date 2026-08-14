import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { ThemeContext } from './ThemeContext';
import { applyTheme, getInitialTheme, THEME_STORAGE_KEY, type ThemeId } from './themes';

export function ThemeProvider({ children }: { children: ReactNode }) {
  // The `data-theme` attribute is applied synchronously so that components
  // reading resolved token values during render always see the active theme.
  const [theme, setThemeState] = useState<ThemeId>(() => {
    const initial = getInitialTheme();
    applyTheme(initial);
    return initial;
  });

  const setTheme = useCallback((next: ThemeId) => {
    applyTheme(next);
    localStorage.setItem(THEME_STORAGE_KEY, next);
    setThemeState(next);
  }, []);

  const value = useMemo(() => ({ theme, setTheme }), [theme, setTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
