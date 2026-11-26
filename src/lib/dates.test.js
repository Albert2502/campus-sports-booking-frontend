import { describe, expect, test } from 'vitest';

import {
  addDays,
  dayLabel,
  formatDayRange,
  formatLongDay,
  formatTime,
  today,
} from './dates';

describe('dates', () => {
  test('today follows Romania, not the device', () => {
    // 23:30 UTC on 30 November is already 1 December in Romania (+02:00).
    expect(today(new Date('2026-11-30T23:30:00Z'))).toBe('2026-12-01');
  });

  test('adds days across months, years and the summer time change', () => {
    expect(addDays('2026-11-30', 1)).toBe('2026-12-01');
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDays('2027-03-28', 1)).toBe('2027-03-29');
    expect(addDays('2026-12-01', -1)).toBe('2026-11-30');
  });

  test('labels days in Romanian', () => {
    expect(dayLabel('2026-11-26')).toEqual({ weekday: 'Joi', dayOfMonth: 26 });
    expect(dayLabel('2026-11-29')).toEqual({ weekday: 'Dum', dayOfMonth: 29 });
    expect(formatLongDay('2026-10-24')).toBe('Sâmbătă, 24 octombrie 2026');
  });

  test('writes a range of days', () => {
    expect(formatDayRange('2026-10-19', '2026-10-25')).toBe(
      '19–25 octombrie 2026',
    );
    expect(formatDayRange('2026-11-26', '2026-12-02')).toBe(
      '26 noiembrie – 2 decembrie 2026',
    );
  });

  test('shows the hour of a slot in Romania', () => {
    expect(formatTime('2026-11-27T14:00:00.000Z')).toBe('16:00');
    expect(formatTime('2027-07-01T15:30:00.000Z')).toBe('18:30');
  });
});
