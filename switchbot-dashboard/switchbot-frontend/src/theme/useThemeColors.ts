import { getPalette, type Palette } from './themes';
import { useTheme } from './useTheme';

/** Literal colour values of the active theme, for Recharts SVG props. */
export function useThemeColors(): Palette {
  const { theme } = useTheme();
  return getPalette(theme);
}
