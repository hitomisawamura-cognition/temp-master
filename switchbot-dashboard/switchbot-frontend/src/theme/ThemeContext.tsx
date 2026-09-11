import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { getInitialTheme, THEME_STORAGE_KEY, type ThemeId } from './themes'

interface ThemeContextValue {
  theme: ThemeId
  setTheme: (theme: ThemeId) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

function applyTheme(theme: ThemeId): ThemeId {
  document.documentElement.dataset.theme = theme
  return theme
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>(() => applyTheme(getInitialTheme()))

  const setTheme = useCallback((next: ThemeId) => {
    localStorage.setItem(THEME_STORAGE_KEY, next)
    setThemeState(applyTheme(next))
  }, [])

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
