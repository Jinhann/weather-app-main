import { beforeEach, describe, expect, it, vi } from 'vitest';
import { johorResponse, jsonResponse } from '../test/fixtures';
import { WeatherApiError } from './errors';
import type { WeatherApiErrorKind } from './errors';
import { buildWeatherUrl, fetchCurrentWeather, getApiKey, toWeatherReport } from './openWeather';

const fetchMock = vi.fn<typeof fetch>();

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
});

const requestedUrl = () => new URL(String(fetchMock.mock.calls[0][0]));

const rejectionKind = async (promise: Promise<unknown>): Promise<WeatherApiErrorKind | null> => {
  try {
    await promise;
  } catch (error) {
    return error instanceof WeatherApiError ? error.kind : null;
  }
  return null;
};

describe('buildWeatherUrl', () => {
  it('includes city, country, key and metric units', () => {
    const url = new URL(buildWeatherUrl({ city: 'Tokyo', country: 'JP' }, 'abc'));

    expect(url.origin + url.pathname).toBe('https://api.openweathermap.org/data/2.5/weather');
    expect(url.searchParams.get('q')).toBe('Tokyo,JP');
    expect(url.searchParams.get('appid')).toBe('abc');
    expect(url.searchParams.get('units')).toBe('metric');
  });

  it('sends only the city when the country is empty', () => {
    const url = new URL(buildWeatherUrl({ city: 'Paris', country: '  ' }, 'abc'));
    expect(url.searchParams.get('q')).toBe('Paris');
  });

  it('trims the city and country', () => {
    const url = new URL(buildWeatherUrl({ city: '  Paris ', country: ' FR ' }, 'abc'));
    expect(url.searchParams.get('q')).toBe('Paris,FR');
  });

  it('encodes special characters', () => {
    const raw = buildWeatherUrl({ city: 'São Paulo & Co', country: 'Brazil' }, 'abc');

    expect(raw).not.toContain(' ');
    expect(raw).not.toContain('&Co');
    expect(new URL(raw).searchParams.get('q')).toBe('São Paulo & Co,Brazil');
  });
});

describe('toWeatherReport', () => {
  it('normalises the API response', () => {
    expect(toWeatherReport(johorResponse)).toEqual({
      city: 'Johor',
      countryCode: 'MY',
      condition: 'Clouds',
      conditionId: 802,
      description: 'scattered clouds',
      iconCode: '03d',
      temperature: 29.4,
      tempMin: 26.2,
      tempMax: 31.1,
      humidity: 58,
      observedAt: new Date(1661996460 * 1000),
    });
  });
});

describe('getApiKey', () => {
  it('returns the trimmed key', () => {
    vi.stubEnv('VITE_OPENWEATHER_API_KEY', '  key  ');
    expect(getApiKey()).toBe('key');
  });

  it('returns an empty string when the key is not set', () => {
    vi.stubEnv('VITE_OPENWEATHER_API_KEY', '');
    expect(getApiKey()).toBe('');
  });
});

describe('fetchCurrentWeather', () => {
  it('requests the API with the configured key and returns a report', async () => {
    fetchMock.mockResolvedValue(jsonResponse(johorResponse));

    const report = await fetchCurrentWeather({ city: 'Johor', country: 'MY' });

    expect(requestedUrl().searchParams.get('appid')).toBe('test-key');
    expect(report).toMatchObject({ city: 'Johor', countryCode: 'MY', conditionId: 802 });
  });

  it('passes the abort signal to fetch', async () => {
    fetchMock.mockResolvedValue(jsonResponse(johorResponse));
    const controller = new AbortController();

    await fetchCurrentWeather({ city: 'Johor', country: '' }, controller.signal);

    expect(fetchMock.mock.calls[0][1]?.signal).toBe(controller.signal);
  });

  it.each([
    [404, 'not-found'],
    [401, 'invalid-api-key'],
    [429, 'rate-limited'],
    [500, 'unknown'],
  ])('rejects HTTP %i with kind %s', async (status, kind) => {
    fetchMock.mockResolvedValue(jsonResponse({ cod: String(status), message: 'x' }, status));

    expect(await rejectionKind(fetchCurrentWeather({ city: 'x', country: '' }))).toBe(kind);
  });

  it('rejects a failed request with the network kind', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));

    expect(await rejectionKind(fetchCurrentWeather({ city: 'x', country: '' }))).toBe('network');
  });

  it('rejects an unreadable body with the unknown kind', async () => {
    fetchMock.mockResolvedValue(new Response('not json', { status: 200 }));

    expect(await rejectionKind(fetchCurrentWeather({ city: 'x', country: '' }))).toBe('unknown');
  });

  it('fails without calling the API when the key is missing', async () => {
    vi.stubEnv('VITE_OPENWEATHER_API_KEY', '');

    expect(await rejectionKind(fetchCurrentWeather({ city: 'x', country: '' }))).toBe(
      'missing-api-key',
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('lets an AbortError propagate untouched', async () => {
    const abort = new DOMException('Aborted', 'AbortError');
    fetchMock.mockRejectedValue(abort);

    await expect(fetchCurrentWeather({ city: 'x', country: '' })).rejects.toBe(abort);
  });
});
