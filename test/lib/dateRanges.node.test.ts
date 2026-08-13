import { test, expect } from 'vite-plus/test';

import { calendarYear, rollingTwelveMonths } from '#src/lib/dateRanges';

test('rollingTwelveMonths spans the trailing 12 months ending on the given date', () => {
  const range = rollingTwelveMonths(new Date('2026-08-13'));

  expect(range).toStrictEqual({ start: '2025-09-01', end: '2026-08-13' });
});

test('calendarYear spans January 1 through December 31 of the given year', () => {
  expect(calendarYear(2025)).toStrictEqual({ start: '2025-01-01', end: '2025-12-31' });
});
