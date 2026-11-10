import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ThemeProvider } from '@/theme/ThemeProvider';
import { THEME_STORAGE_KEY } from '@/theme/themes';
import { ThemeSwitcher } from './ThemeSwitcher';

function mockSystemDark(dark: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: dark && query.includes('dark'),
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
}

function renderSwitcher() {
  return render(
    <ThemeProvider>
      <ThemeSwitcher />
    </ThemeProvider>,
  );
}

describe('ThemeSwitcher', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  it('defaults to the OS preference', () => {
    mockSystemDark(true);
    renderSwitcher();
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
    expect(screen.getByRole('radio', { name: /dark/i })).toHaveAttribute('aria-checked', 'true');
  });

  it('prefers the stored theme over the OS preference', () => {
    mockSystemDark(true);
    localStorage.setItem(THEME_STORAGE_KEY, 'contrast');
    renderSwitcher();
    expect(document.documentElement).toHaveAttribute('data-theme', 'contrast');
  });

  it('switches theme and persists it to localStorage', () => {
    mockSystemDark(false);
    renderSwitcher();
    expect(document.documentElement).toHaveAttribute('data-theme', 'light');

    fireEvent.click(screen.getByRole('radio', { name: /high contrast/i }));
    expect(document.documentElement).toHaveAttribute('data-theme', 'contrast');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('contrast');
  });
});
