import type { OpenWeatherResponse, SearchQuery, WeatherReport } from '../types/weather';
import { WeatherApiError, isAbortError } from './errors';
import type { WeatherApiErrorKind } from './errors';

const ENDPOINT = 'https://api.openweathermap.org/data/2.5/weather';

/** Read lazily so the key can be changed (or stubbed in tests) without reloading modules. */
export function getApiKey(): string {
  return (import.meta.env.VITE_OPENWEATHER_API_KEY as string | undefined)?.trim() ?? '';
}

/** Builds the request URL. The country is only appended when provided. */
export function buildWeatherUrl({ city, country }: SearchQuery, apiKey: string): string {
  const location = [city.trim(), country.trim()].filter(Boolean).join(',');
  const params = new URLSearchParams({ q: location, appid: apiKey, units: 'metric' });
  return `${ENDPOINT}?${params.toString()}`;
}

function statusToErrorKind(status: number): WeatherApiErrorKind {
  switch (status) {
    case 404:
      return 'not-found';
    case 401:
      return 'invalid-api-key';
    case 429:
      return 'rate-limited';
    default:
      return 'unknown';
  }
}

/** Converts the raw API payload into the app's domain model. */
export function toWeatherReport(raw: OpenWeatherResponse): WeatherReport {
  const [weather] = raw.weather;
  return {
    city: raw.name,
    countryCode: raw.sys.country,
    condition: weather.main,
    conditionId: weather.id,
    description: weather.description,
    iconCode: weather.icon,
    temperature: raw.main.temp,
    tempMin: raw.main.temp_min,
    tempMax: raw.main.temp_max,
    humidity: raw.main.humidity,
    observedAt: new Date(raw.dt * 1000),
  };
}

/**
 * Fetches the current weather for `query`. Rejects with a `WeatherApiError`;
 * an aborted request rejects with the original `AbortError`.
 */
export async function fetchCurrentWeather(
  query: SearchQuery,
  signal?: AbortSignal,
): Promise<WeatherReport> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new WeatherApiError('missing-api-key');
  }

  let response: Response;
  try {
    response = await fetch(buildWeatherUrl(query, apiKey), { signal });
  } catch (error) {
    if (isAbortError(error)) throw error;
    throw new WeatherApiError('network');
  }

  if (!response.ok) {
    throw new WeatherApiError(statusToErrorKind(response.status));
  }

  try {
    return toWeatherReport((await response.json()) as OpenWeatherResponse);
  } catch (error) {
    if (isAbortError(error)) throw error;
    throw new WeatherApiError('unknown');
  }
}
