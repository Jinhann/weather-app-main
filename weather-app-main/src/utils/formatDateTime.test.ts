import { describe, expect, it } from 'vitest';
import { formatDateTime } from './formatDateTime';

describe('formatDateTime', () => {
  it('formats as DD-MM-YYYY hh:mma in local time', () => {
    expect(formatDateTime(new Date(2022, 8, 1, 9, 41))).toBe('01-09-2022 09:41am');
  });

  it('uses a 12-hour clock with pm', () => {
    expect(formatDateTime(new Date(2022, 11, 25, 13, 5))).toBe('25-12-2022 01:05pm');
  });

  it('handles midnight and noon', () => {
    expect(formatDateTime(new Date(2022, 0, 2, 0, 0))).toBe('02-01-2022 12:00am');
    expect(formatDateTime(new Date(2022, 0, 2, 12, 0))).toBe('02-01-2022 12:00pm');
  });
});
