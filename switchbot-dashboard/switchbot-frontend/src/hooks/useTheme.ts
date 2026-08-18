import { useCallback, useEffect, useState } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'temp-master-theme';

function readStoredMode(): ThemeMode {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      return stored;
    }
  } catch {
    // localStorage が使えない環境ではシステム設定に従う
  }
  return 'system';
}

function prefersDark(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function resolveDark(mode: ThemeMode): boolean {
  return mode === 'dark' || (mode === 'system' && prefersDark());
}

/**
 * テーマ設定を localStorage に永続化し、<html> の dark クラスを同期する。
 * 初期値は localStorage → OS の prefers-color-scheme の順で決定する。
 */
export function useTheme() {
  const [mode, setMode] = useState<ThemeMode>(() => readStoredMode());
  const [isDark, setIsDark] = useState<boolean>(() => resolveDark(readStoredMode()));

  useEffect(() => {
    const dark = resolveDark(mode);
    setIsDark(dark);
    document.documentElement.classList.toggle('dark', dark);
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      // 永続化できない場合もテーマ適用自体は継続する
    }
  }, [mode]);

  useEffect(() => {
    if (mode !== 'system') {
      return;
    }
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (event: MediaQueryListEvent) => {
      setIsDark(event.matches);
      document.documentElement.classList.toggle('dark', event.matches);
    };
    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, [mode]);

  const changeMode = useCallback((next: ThemeMode) => setMode(next), []);

  return { mode, isDark, setMode: changeMode };
}
