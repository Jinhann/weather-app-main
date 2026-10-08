import type { HistoryEntry, HistoryLocation } from '../types/history';

/** True when both locations name the same city and country, ignoring case. */
export const isSameLocation = (a: HistoryLocation, b: HistoryLocation): boolean =>
  a.city.toLowerCase() === b.city.toLowerCase() &&
  a.countryCode.toLowerCase() === b.countryCode.toLowerCase();

/** Generates an id, falling back when `crypto.randomUUID` is unavailable (e.g. insecure contexts). */
export function createId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Type guard used to validate whatever was read back from localStorage. */
export function isHistoryEntryList(value: unknown): value is HistoryEntry[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        typeof item === 'object' &&
        item !== null &&
        typeof item.id === 'string' &&
        typeof item.city === 'string' &&
        typeof item.countryCode === 'string' &&
        typeof item.searchedAt === 'string' &&
        !Number.isNaN(Date.parse(item.searchedAt)),
    )
  );
}
