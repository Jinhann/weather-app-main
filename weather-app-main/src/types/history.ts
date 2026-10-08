/** One persisted row of the search history. */
export interface HistoryEntry {
  id: string;
  city: string;
  countryCode: string;
  /** ISO 8601 timestamp of the (most recent) search. */
  searchedAt: string;
}

/** The part of a history entry that identifies a place. */
export type HistoryLocation = Pick<HistoryEntry, 'city' | 'countryCode'>;
