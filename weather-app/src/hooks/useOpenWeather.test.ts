import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { WeatherApiError } from '../api/errors';
import type { WeatherApiErrorKind } from '../api/errors';
import { fetchCurrentWeather } from '../api/openWeather';
import type { WeatherReport } from '../types/weather';
import { useOpenWeather } from './useOpenWeather';

vi.mock('../api/openWeather', () => ({ fetchCurrentWeather: vi.fn() }));

const fetchMock = vi.mocked(fetchCurrentWeather);

const report: WeatherReport = {
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
};

beforeEach(() => {
  fetchMock.mockReset();
});

function setup() {
  return renderHook(() => useOpenWeather());
}

/** A request that stays pending until its signal is aborted. */
const pendingUntilAborted = (_query: unknown, signal?: AbortSignal) =>
  new Promise<WeatherReport>((_resolve, reject) => {
    signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
  });

const query = { city: 'x', country: '' };

describe('useOpenWeather', () => {
  it('resolves to the report from the API layer', async () => {
    fetchMock.mockResolvedValue(report);
    const { result } = setup();

    expect(await result.current.fetchWeather({ city: 'Johor', country: 'MY' })).toBe(report);
    expect(fetchMock).toHaveBeenCalledWith(
      { city: 'Johor', country: 'MY' },
      expect.any(AbortSignal),
    );
  });

  it('returns a stable function across renders', () => {
    const { result, rerender } = setup();
    const first = result.current.fetchWeather;

    rerender();

    expect(result.current.fetchWeather).toBe(first);
  });

  it.each<[WeatherApiErrorKind, string]>([
    ['not-found', 'Not found. Please check the city and country names.'],
    ['invalid-api-key', 'The weather service rejected the API key. Please check the configuration.'],
    ['rate-limited', 'Too many requests. Please wait a moment and try again.'],
    ['network', 'Unable to reach the weather service. Check your connection and try again.'],
    [
      'missing-api-key',
      'The weather API key is missing. Set VITE_OPENWEATHER_API_KEY in your .env file.',
    ],
    ['unknown', 'Something went wrong while fetching the weather. Please try again.'],
  ])('rejects a %s API error with a user-facing message', async (kind, message) => {
    fetchMock.mockRejectedValue(new WeatherApiError(kind));
    const { result } = setup();

    await expect(result.current.fetchWeather(query)).rejects.toThrow(message);
  });

  it('rejects an unexpected error with the generic message', async () => {
    fetchMock.mockRejectedValue(new TypeError('boom'));
    const { result } = setup();

    await expect(result.current.fetchWeather(query)).rejects.toThrow(
      'Something went wrong while fetching the weather. Please try again.',
    );
  });

  it('aborts a superseded request and resolves it to null', async () => {
    fetchMock.mockImplementationOnce(pendingUntilAborted);
    fetchMock.mockResolvedValueOnce(report);
    const { result } = setup();

    const first = result.current.fetchWeather({ city: 'Tokyo', country: '' });
    const second = result.current.fetchWeather({ city: 'Johor', country: '' });

    expect(await first).toBeNull();
    expect(await second).toBe(report);
    expect(fetchMock.mock.calls[0][1]?.aborted).toBe(true);
    expect(fetchMock.mock.calls[1][1]?.aborted).toBe(false);
  });

  it('ignores a superseded response that still resolves', async () => {
    let resolveFirst: (value: WeatherReport) => void = () => {};
    fetchMock.mockImplementationOnce(
      () => new Promise<WeatherReport>((resolve) => (resolveFirst = resolve)),
    );
    fetchMock.mockResolvedValueOnce(report);
    const { result } = setup();

    const first = result.current.fetchWeather({ city: 'Tokyo', country: '' });
    await result.current.fetchWeather({ city: 'Johor', country: '' });
    resolveFirst({ ...report, city: 'Tokyo' });

    expect(await first).toBeNull();
  });

  it('aborts the request in flight on unmount', async () => {
    fetchMock.mockImplementationOnce(pendingUntilAborted);
    const { result, unmount } = setup();

    const pending = result.current.fetchWeather({ city: 'Tokyo', country: '' });
    unmount();

    expect(await pending).toBeNull();
    expect(fetchMock.mock.calls[0][1]?.aborted).toBe(true);
  });
});
