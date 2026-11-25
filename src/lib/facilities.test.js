import { describe, expect, test } from 'vitest';

import { formatPrice, normalizeText, programText } from './facilities';

function week(overrides = {}) {
  return Array.from({ length: 7 }, (_, index) => ({
    weekday: index + 1,
    closed: false,
    opensAt: '08:00',
    closesAt: '22:00',
    ...overrides[index],
  }));
}

const CLOSED = { closed: true, opensAt: null, closesAt: null };

describe('programText', () => {
  test('no schedule means no restriction', () => {
    expect(programText(null)).toBe('Fără restricție');
  });

  test('all days closed', () => {
    expect(
      programText(
        week(Object.fromEntries([0, 1, 2, 3, 4, 5, 6].map((i) => [i, CLOSED]))),
      ),
    ).toBe('Închis');
  });

  test('the same hours on every open day show the range', () => {
    expect(programText(week())).toBe('08:00–22:00');
  });

  test('closed days are ignored when the open days agree', () => {
    expect(programText(week({ 5: CLOSED, 6: CLOSED }))).toBe('08:00–22:00');
  });

  test('different hours are variable', () => {
    expect(programText(week({ 6: { opensAt: '10:00' } }))).toBe(
      'Program variabil',
    );
  });
});

describe('normalizeText', () => {
  test('ignores case and Romanian diacritics', () => {
    expect(normalizeText('Sală ȘȚ ăâî')).toBe('sala st aai');
  });

  test('handles null', () => {
    expect(normalizeText(null)).toBe('');
  });
});

describe('formatPrice', () => {
  test('zero is free', () => {
    expect(formatPrice(0)).toBe('Gratuit');
  });

  test('integers have no decimals', () => {
    expect(formatPrice(120)).toBe('120 lei');
  });

  test('fractions have two decimals with a comma', () => {
    expect(formatPrice(12.5)).toBe('12,50 lei');
  });
});
