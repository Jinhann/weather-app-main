import { describe, expect, it } from 'vitest';
import { WeatherApiError, getErrorMessage, isAbortError } from './errors';
import type { WeatherApiErrorKind } from './errors';

describe('getErrorMessage', () => {
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
  ])('maps %s to its message', (kind, message) => {
    expect(getErrorMessage(kind)).toBe(message);
  });
});

describe('WeatherApiError', () => {
  it('carries its kind', () => {
    const error = new WeatherApiError('network');

    expect(error).toBeInstanceOf(Error);
    expect(error.kind).toBe('network');
  });
});

describe('isAbortError', () => {
  it('recognises an AbortError', () => {
    expect(isAbortError(new DOMException('Aborted', 'AbortError'))).toBe(true);
  });

  it('rejects other errors', () => {
    expect(isAbortError(new TypeError('Failed to fetch'))).toBe(false);
    expect(isAbortError(new DOMException('Nope', 'NotFoundError'))).toBe(false);
    expect(isAbortError('AbortError')).toBe(false);
  });
});
