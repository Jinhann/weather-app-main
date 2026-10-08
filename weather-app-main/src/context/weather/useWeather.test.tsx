import { renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useWeather } from './useWeather';

const swallowError = (event: ErrorEvent) => event.preventDefault();

afterEach(() => window.removeEventListener('error', swallowError));

describe('useWeather', () => {
  it('throws a helpful error outside a WeatherProvider', () => {
    // Keep the expected render error out of the test output.
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    window.addEventListener('error', swallowError);

    expect(() => renderHook(() => useWeather())).toThrow(
      'useWeather must be used within a WeatherProvider',
    );
  });
});
