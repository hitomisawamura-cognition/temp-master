/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--color-bg)',
        panel: 'var(--color-panel)',
        'panel-header': 'var(--color-panel-header)',
        fg: 'var(--color-fg)',
        muted: 'var(--color-muted)',
        border: 'var(--color-border)',
        accent: 'var(--color-accent)',
        'accent-fg': 'var(--color-accent-fg)',
        danger: 'var(--color-danger)',
        info: 'var(--color-info)',
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        'warning-bg': 'var(--color-warning-bg)',
        'warning-fg': 'var(--color-warning-fg)',
      },
      fontFamily: {
        sans: 'var(--font-sans)',
      },
    },
  },
  plugins: [],
}
