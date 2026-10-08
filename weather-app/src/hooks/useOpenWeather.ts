import { useCallback, useEffect, useRef } from 'react';
import { WeatherApiError, getErrorMessage, isAbortError } from '../api/errors';
import { fetchCurrentWeather } from '../api/openWeather';
import type { SearchQuery, WeatherReport } from '../types/weather';

/**
 * Owns the OpenWeather request lifecycle. Only the latest request matters:
 * a new `fetchWeather` call aborts the previous one, and the request in flight is
 * aborted on unmount. `fetchWeather` resolves to `null` for a superseded request,
 * and otherwise to a report or a rejection whose message is user-facing.
 */
export function useOpenWeather() {
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => () => controllerRef.current?.abort(), []);

  const fetchWeather = useCallback(async (query: SearchQuery): Promise<WeatherReport | null> => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    try {
      const report = await fetchCurrentWeather(query, controller.signal);
      return controller.signal.aborted ? null : report;
    } catch (error) {
      if (isAbortError(error)) return null;
      const kind = error instanceof WeatherApiError ? error.kind : 'unknown';
      throw new Error(getErrorMessage(kind));
    }
  }, []);

  return { fetchWeather };
}
