import { describe, expect, it } from 'vitest';
import { DEFAULT_DISPLAY_NAMES, getDisplayName, parseDisplayNames, parseDisplayNamesJson } from './displayNames';

describe('displayNames', () => {
  it('maps known device names and passes unknown names through', () => {
    expect(getDisplayName('Bedroom Meter', DEFAULT_DISPLAY_NAMES)).toBe('第1蒸留塔 (T-101)');
    expect(getDisplayName('Unknown', DEFAULT_DISPLAY_NAMES)).toBe('Unknown');
    expect(getDisplayName('toString', DEFAULT_DISPLAY_NAMES)).toBe('toString');
  });

  it('accepts only string values from overrides', () => {
    expect(parseDisplayNames({ a: 'A', b: 1, c: null })).toEqual({ a: 'A' });
    expect(parseDisplayNames(['x'])).toEqual({});
    expect(parseDisplayNames(null)).toEqual({});
  });

  it('ignores invalid JSON overrides', () => {
    expect(parseDisplayNamesJson('{"Bedroom Meter":"Main"}')).toEqual({ 'Bedroom Meter': 'Main' });
    expect(parseDisplayNamesJson('{oops')).toEqual({});
    expect(parseDisplayNamesJson(undefined)).toEqual({});
  });
});
