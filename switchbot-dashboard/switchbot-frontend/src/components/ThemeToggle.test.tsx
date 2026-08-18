import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeToggle } from './ThemeToggle';

describe('ThemeToggle', () => {
  it('選択中のモードが押下状態になる', () => {
    render(<ThemeToggle mode="dark" onChange={vi.fn()} />);
    expect(screen.getByTitle('ダーク')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByTitle('ライト')).toHaveAttribute('aria-pressed', 'false');
  });

  it('クリックでモード変更が通知される', () => {
    const onChange = vi.fn();
    render(<ThemeToggle mode="light" onChange={onChange} />);
    screen.getByTitle('システム設定').click();
    expect(onChange).toHaveBeenCalledWith('system');
  });
});
