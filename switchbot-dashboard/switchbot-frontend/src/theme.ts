export type Theme = 'light' | 'dark' | 'industrial';
export function initialTheme(): Theme {
  try {
    const value = localStorage.getItem('theme');
    if (value === 'light' || value === 'dark' || value === 'industrial')
      return value;
  } catch {
    /* Storage may be unavailable. */
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}
export function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem('theme', theme);
  } catch {
    /* Keep the in-memory preference. */
  }
}
