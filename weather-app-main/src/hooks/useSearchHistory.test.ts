import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { HistoryEntry } from '../types/history';
import {
  HISTORY_STORAGE_KEY,
  MAX_HISTORY_ENTRIES,
  historyReducer,
  useSearchHistory,
} from './useSearchHistory';

const johor = { city: 'Johor', countryCode: 'MY' };
const tokyo = { city: 'Tokyo', countryCode: 'JP' };

const storedEntries = () => JSON.parse(window.localStorage.getItem(HISTORY_STORAGE_KEY) ?? 'null');

describe('historyReducer', () => {
  const entry = (id: string, city: string, countryCode = 'XX'): HistoryEntry => ({
    id,
    city,
    countryCode,
    searchedAt: '2022-09-01T00:00:00.000Z',
  });

  it('adds a new entry to the top', () => {
    const next = historyReducer([entry('1', 'Johor', 'MY')], {
      type: 'add',
      id: '2',
      location: tokyo,
      searchedAt: '2022-09-02T00:00:00.000Z',
    });

    expect(next.map((item) => item.id)).toEqual(['2', '1']);
  });

  it('moves a case-insensitive duplicate to the top, keeping its id', () => {
    const next = historyReducer([entry('1', 'Tokyo', 'JP'), entry('2', 'Johor', 'MY')], {
      type: 'add',
      id: 'new',
      location: { city: 'JOHOR', countryCode: 'my' },
      searchedAt: '2022-09-03T00:00:00.000Z',
    });

    expect(next).toEqual([
      { id: '2', city: 'JOHOR', countryCode: 'my', searchedAt: '2022-09-03T00:00:00.000Z' },
      entry('1', 'Tokyo', 'JP'),
    ]);
  });

  it('caps the list, dropping the oldest', () => {
    const full = Array.from({ length: MAX_HISTORY_ENTRIES }, (_, index) =>
      entry(`${index}`, `City ${index}`),
    );

    const next = historyReducer(full, {
      type: 'add',
      id: 'new',
      location: tokyo,
      searchedAt: '2022-09-03T00:00:00.000Z',
    });

    expect(next).toHaveLength(MAX_HISTORY_ENTRIES);
    expect(next[0].id).toBe('new');
    expect(next.at(-1)?.id).toBe(`${MAX_HISTORY_ENTRIES - 2}`);
  });

  it('removes an entry by id', () => {
    const next = historyReducer([entry('1', 'Johor'), entry('2', 'Tokyo')], {
      type: 'remove',
      id: '1',
    });

    expect(next.map((item) => item.id)).toEqual(['2']);
  });
});

describe('useSearchHistory', () => {
  it('starts empty', () => {
    const { result } = renderHook(() => useSearchHistory());
    expect(result.current.entries).toEqual([]);
  });

  it('adds entries newest first with an id and ISO timestamp', () => {
    const { result } = renderHook(() => useSearchHistory());
    const when = new Date('2022-09-01T01:41:00Z');

    act(() => result.current.add(johor, when));
    act(() => result.current.add(tokyo, new Date('2022-09-02T00:00:00Z')));

    expect(result.current.entries.map((item) => item.city)).toEqual(['Tokyo', 'Johor']);
    expect(result.current.entries[1]).toMatchObject({
      ...johor,
      searchedAt: when.toISOString(),
    });
    expect(result.current.entries[1].id).toEqual(expect.any(String));
  });

  it('moves a duplicate (case-insensitive) to the top with the new timestamp', () => {
    const { result } = renderHook(() => useSearchHistory());
    act(() => result.current.add(johor, new Date('2022-09-01T00:00:00Z')));
    act(() => result.current.add(tokyo, new Date('2022-09-02T00:00:00Z')));

    const later = new Date('2022-09-03T00:00:00Z');
    act(() => result.current.add({ city: 'JOHOR', countryCode: 'my' }, later));

    expect(result.current.entries).toHaveLength(2);
    expect(result.current.entries[0]).toMatchObject({
      city: 'JOHOR',
      searchedAt: later.toISOString(),
    });
  });

  it(`keeps at most ${MAX_HISTORY_ENTRIES} entries`, () => {
    const { result } = renderHook(() => useSearchHistory());
    for (let index = 0; index < MAX_HISTORY_ENTRIES + 5; index += 1) {
      act(() => result.current.add({ city: `City ${index}`, countryCode: 'XX' }, new Date()));
    }

    expect(result.current.entries).toHaveLength(MAX_HISTORY_ENTRIES);
    expect(result.current.entries[0].city).toBe(`City ${MAX_HISTORY_ENTRIES + 4}`);
  });

  it('removes an entry by id', () => {
    const { result } = renderHook(() => useSearchHistory());
    act(() => result.current.add(johor, new Date()));
    act(() => result.current.add(tokyo, new Date()));
    const [newest] = result.current.entries;

    act(() => result.current.remove(newest.id));

    expect(result.current.entries.map((item) => item.city)).toEqual(['Johor']);
  });

  it('persists to localStorage', () => {
    const { result } = renderHook(() => useSearchHistory());
    act(() => result.current.add(johor, new Date()));

    expect(storedEntries()).toEqual(result.current.entries);
  });

  it('loads existing entries from localStorage', () => {
    const saved = [{ id: '1', ...johor, searchedAt: '2022-09-01T01:41:00.000Z' }];
    window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(saved));

    const { result } = renderHook(() => useSearchHistory());

    expect(result.current.entries).toEqual(saved);
  });

  it.each([
    ['invalid JSON', '{not json'],
    ['the wrong shape', JSON.stringify([{ city: 'Johor' }])],
    ['a non-array value', JSON.stringify({ city: 'Johor' })],
  ])('falls back to an empty list for %s', (_label, raw) => {
    window.localStorage.setItem(HISTORY_STORAGE_KEY, raw);

    const { result } = renderHook(() => useSearchHistory());

    expect(result.current.entries).toEqual([]);
  });
});
