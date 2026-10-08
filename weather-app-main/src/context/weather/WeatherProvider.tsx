import { useCallback, useMemo, useReducer } from 'react';
import type { ReactNode } from 'react';
import { useOpenWeather } from '../../hooks/useOpenWeather';
import { useSearchHistory } from '../../hooks/useSearchHistory';
import type { HistoryEntry } from '../../types/history';
import type { SearchQuery, WeatherReport } from '../../types/weather';
import { WeatherContext } from './WeatherContext';
import type { WeatherContextValue, WeatherStatus } from './WeatherContext';

interface WeatherState {
  status: WeatherStatus;
  report: WeatherReport | null;
  searchedAt: Date | null;
  error: string | null;
}

type WeatherAction =
  | { type: 'search-started' }
  | { type: 'search-succeeded'; report: WeatherReport; searchedAt: Date }
  | { type: 'search-failed'; message: string }
  | { type: 'error-cleared' };

const initialState: WeatherState = { status: 'idle', report: null, searchedAt: null, error: null };

/** The last successful report is kept while loading and after errors. */
function weatherReducer(state: WeatherState, action: WeatherAction): WeatherState {
  switch (action.type) {
    case 'search-started':
      return { ...state, status: 'loading', error: null };
    case 'search-succeeded':
      return {
        status: 'success',
        report: action.report,
        searchedAt: action.searchedAt,
        error: null,
      };
    case 'search-failed':
      return { ...state, status: 'error', error: action.message };
    case 'error-cleared':
      return state.status === 'error' ? { ...state, status: 'idle', error: null } : state;
  }
}

/** Owns all weather state: the current report, request status and the search history. */
export function WeatherProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(weatherReducer, initialState);
  const { fetchWeather } = useOpenWeather();
  const { entries, add, remove } = useSearchHistory();

  const search = useCallback(
    async (query: SearchQuery) => {
      dispatch({ type: 'search-started' });
      try {
        const report = await fetchWeather(query);
        if (!report) return;
        const searchedAt = new Date();
        dispatch({ type: 'search-succeeded', report, searchedAt });
        add(report, searchedAt);
      } catch (error) {
        dispatch({
          type: 'search-failed',
          message: error instanceof Error ? error.message : String(error),
        });
      }
    },
    [fetchWeather, add],
  );

  const searchAgain = useCallback(
    (entry: HistoryEntry) => search({ city: entry.city, country: entry.countryCode }),
    [search],
  );

  const clearError = useCallback(() => dispatch({ type: 'error-cleared' }), []);

  const value = useMemo<WeatherContextValue>(
    () => ({
      status: state.status,
      report: state.report,
      searchedAt: state.searchedAt,
      error: state.error,
      history: entries,
      search,
      searchAgain,
      removeHistoryEntry: remove,
      clearError,
    }),
    [state, entries, search, searchAgain, remove, clearError],
  );

  return <WeatherContext.Provider value={value}>{children}</WeatherContext.Provider>;
}
