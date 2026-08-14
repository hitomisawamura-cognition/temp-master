/**
 * Theme palettes. These are the single source of truth for colours: the
 * provider writes them onto the root element as CSS variables (consumed by the
 * Tailwind tokens declared in `index.css`), and chart components read the same
 * palette directly because Recharts needs literal colour values.
 */
export interface Palette {
  bg: string;
  panel: string;
  panelHeader: string;
  border: string;
  text: string;
  muted: string;
  accent: string;
  accentText: string;
  danger: string;
  info: string;
  success: string;
  warn: string;
  warnBg: string;
  warnText: string;
  chartLine: string;
  chartGrid: string;
}

export const THEMES = [
  {
    id: 'light',
    label: 'Light',
    colorScheme: 'light',
    // Mirrors the look of the previous Bootstrap 3 dashboard.
    palette: {
      bg: '#f5f5f5',
      panel: '#ffffff',
      panelHeader: '#f8f8f8',
      border: '#dddddd',
      text: '#333333',
      muted: '#777777',
      accent: '#337ab7',
      accentText: '#ffffff',
      danger: '#d9534f',
      info: '#5bc0de',
      success: '#5cb85c',
      warn: '#f0ad4e',
      warnBg: '#fcf8e3',
      warnText: '#8a6d3b',
      chartLine: '#d9534f',
      chartGrid: 'rgba(0, 0, 0, 0.08)',
    },
  },
  {
    id: 'dark',
    label: 'Dark',
    colorScheme: 'dark',
    palette: {
      bg: '#14181d',
      panel: '#1e242b',
      panelHeader: '#262e37',
      border: '#333d47',
      text: '#e6edf3',
      muted: '#93a1b0',
      accent: '#4a9eff',
      accentText: '#0b1015',
      danger: '#f2777a',
      info: '#56b6c2',
      success: '#56b877',
      warn: '#e0a33e',
      warnBg: '#3a2f14',
      warnText: '#f0d08a',
      chartLine: '#4a9eff',
      chartGrid: 'rgba(255, 255, 255, 0.12)',
    },
  },
  {
    id: 'industrial',
    label: 'Industrial',
    colorScheme: 'dark',
    // High-contrast control-room palette.
    palette: {
      bg: '#0b0f0c',
      panel: '#131a14',
      panelHeader: '#1b2a1c',
      border: '#3f5a41',
      text: '#d7ffd9',
      muted: '#86ab88',
      accent: '#ffb000',
      accentText: '#1a1200',
      danger: '#ff5f4d',
      info: '#00d2ff',
      success: '#35ff6f',
      warn: '#ffb000',
      warnBg: '#2b2000',
      warnText: '#ffd166',
      chartLine: '#35ff6f',
      chartGrid: 'rgba(215, 255, 217, 0.14)',
    },
  },
] as const satisfies readonly {
  id: string;
  label: string;
  colorScheme: 'light' | 'dark';
  palette: Palette;
}[];

export type ThemeId = (typeof THEMES)[number]['id'];

export const THEME_STORAGE_KEY = 'temp-master-theme';

const CSS_VARIABLES: Record<keyof Palette, string> = {
  bg: '--app-bg',
  panel: '--app-panel',
  panelHeader: '--app-panel-header',
  border: '--app-border',
  text: '--app-text',
  muted: '--app-muted',
  accent: '--app-accent',
  accentText: '--app-accent-text',
  danger: '--app-danger',
  info: '--app-info',
  success: '--app-success',
  warn: '--app-warn',
  warnBg: '--app-warn-bg',
  warnText: '--app-warn-text',
  chartLine: '--app-chart-line',
  chartGrid: '--app-chart-grid',
};

export function isThemeId(value: string | null): value is ThemeId {
  return THEMES.some((theme) => theme.id === value);
}

export function getTheme(id: ThemeId) {
  return THEMES.find((theme) => theme.id === id) ?? THEMES[0];
}

export function getPalette(id: ThemeId): Palette {
  return getTheme(id).palette;
}

export function applyTheme(id: ThemeId): void {
  const theme = getTheme(id);
  const root = document.documentElement;

  root.dataset.theme = theme.id;
  root.style.colorScheme = theme.colorScheme;
  for (const [key, variable] of Object.entries(CSS_VARIABLES)) {
    root.style.setProperty(variable, theme.palette[key as keyof Palette]);
  }
}

export function getInitialTheme(): ThemeId {
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (isThemeId(stored)) {
    return stored;
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}
