import { createContext } from 'react';
import type { HistoryEntry } from '../../types/history';
import type { SearchQuery, WeatherReport } from '../../types/weather';

export type WeatherStatus = 'idle' | 'loading' | 'success' | 'error';

export interface WeatherContextValue {
  status: WeatherStatus;
  /** Last successful report; stays set while a new search loads or after an error. */
  report: WeatherReport | null;
  /** When the user made the search that produced `report`. */
  searchedAt: Date | null;
  /** User-facing message, set only while `status` is "error". */
  error: string | null;
  history: HistoryEntry[];
  search: (query: SearchQuery) => Promise<void>;
  searchAgain: (entry: HistoryEntry) => Promise<void>;
  removeHistoryEntry: (id: string) => void;
  clearError: () => void;
}

export const WeatherContext = createContext<WeatherContextValue | null>(null);
