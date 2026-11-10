import type { Config } from 'tailwindcss';

const withVar = (name: string) => `hsl(var(--${name}) / <alpha-value>)`;

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: withVar('background'),
        foreground: withVar('foreground'),
        card: { DEFAULT: withVar('card'), foreground: withVar('card-foreground') },
        muted: { DEFAULT: withVar('muted'), foreground: withVar('muted-foreground') },
        accent: { DEFAULT: withVar('accent'), foreground: withVar('accent-foreground') },
        primary: { DEFAULT: withVar('primary'), foreground: withVar('primary-foreground') },
        border: withVar('border'),
        input: withVar('input'),
        ring: withVar('ring'),
        success: { DEFAULT: withVar('success'), foreground: withVar('success-foreground') },
        warning: { DEFAULT: withVar('warning'), foreground: withVar('warning-foreground') },
        danger: { DEFAULT: withVar('danger'), foreground: withVar('danger-foreground') },
        info: { DEFAULT: withVar('info'), foreground: withVar('info-foreground') },
        temperature: withVar('chart-temperature'),
        humidity: withVar('chart-humidity'),
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [],
} satisfies Config;
