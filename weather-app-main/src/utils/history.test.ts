import { describe, expect, it, vi } from 'vitest';
import { createId, isHistoryEntryList, isSameLocation } from './history';

const entry = { id: '1', city: 'Johor', countryCode: 'MY', searchedAt: '2022-09-01T01:41:00.000Z' };

describe('isSameLocation', () => {
  it('ignores case', () => {
    expect(
      isSameLocation({ city: 'JOHOR', countryCode: 'my' }, { city: 'Johor', countryCode: 'MY' }),
    ).toBe(true);
  });

  it('differs on city or country', () => {
    const johor = { city: 'Johor', countryCode: 'MY' };

    expect(isSameLocation(johor, { city: 'Tokyo', countryCode: 'MY' })).toBe(false);
    expect(isSameLocation(johor, { city: 'Johor', countryCode: 'JP' })).toBe(false);
  });
});

describe('isHistoryEntryList', () => {
  it('accepts a valid list, including an empty one', () => {
    expect(isHistoryEntryList([entry])).toBe(true);
    expect(isHistoryEntryList([])).toBe(true);
  });

  it.each([
    ['a non-array', { city: 'Johor' }],
    ['null', null],
    ['an entry with missing fields', [{ city: 'Johor' }]],
    ['an entry with a wrong field type', [{ ...entry, id: 1 }]],
    ['an invalid timestamp', [{ ...entry, searchedAt: 'yesterday' }]],
    ['a null item', [null]],
  ])('rejects %s', (_label, value) => {
    expect(isHistoryEntryList(value)).toBe(false);
  });
});

describe('createId', () => {
  it('uses crypto.randomUUID when available', () => {
    vi.stubGlobal('crypto', { randomUUID: () => 'uuid' });
    expect(createId()).toBe('uuid');
  });

  it('falls back to a generated id without crypto.randomUUID', () => {
    vi.stubGlobal('crypto', {});

    const first = createId();

    expect(first).toEqual(expect.any(String));
    expect(first).not.toBe('');
    expect(createId()).not.toBe(first);
  });
});
