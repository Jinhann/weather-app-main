import { useCallback } from 'react';
import type { HistoryEntry, HistoryLocation } from '../types/history';
import { createId, isHistoryEntryList, isSameLocation } from '../utils/history';
import { usePersistentReducer } from './useLocalStorage';

export const HISTORY_STORAGE_KEY = 'todays-weather:history:v1';
export const MAX_HISTORY_ENTRIES = 20;

type HistoryAction =
  | { type: 'add'; id: string; location: HistoryLocation; searchedAt: string }
  | { type: 'remove'; id: string };

/**
 * Pure history reducer. `add` puts the location at the top (newest first), replacing an
 * existing entry for the same city + country instead of duplicating it, and caps the list.
 */
export function historyReducer(entries: HistoryEntry[], action: HistoryAction): HistoryEntry[] {
  switch (action.type) {
    case 'add': {
      const existing = entries.find((entry) => isSameLocation(entry, action.location));
      const entry: HistoryEntry = {
        id: existing?.id ?? action.id,
        city: action.location.city,
        countryCode: action.location.countryCode,
        searchedAt: action.searchedAt,
      };
      const others = entries.filter((item) => item !== existing);
      return [entry, ...others].slice(0, MAX_HISTORY_ENTRIES);
    }
    case 'remove':
      return entries.filter((entry) => entry.id !== action.id);
  }
}

/** Persistent, de-duplicated, newest-first list of searched locations. */
export function useSearchHistory() {
  const [entries, dispatch] = usePersistentReducer(
    historyReducer,
    HISTORY_STORAGE_KEY,
    [],
    isHistoryEntryList,
  );

  const add = useCallback(
    (location: HistoryLocation, searchedAt: Date) =>
      dispatch({ type: 'add', id: createId(), location, searchedAt: searchedAt.toISOString() }),
    [dispatch],
  );

  const remove = useCallback((id: string) => dispatch({ type: 'remove', id }), [dispatch]);

  return { entries, add, remove };
}
