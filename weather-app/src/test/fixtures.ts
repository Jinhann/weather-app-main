import type { OpenWeatherResponse } from '../types/weather';

/** Raw API payload resembling a real OpenWeather response for Johor, Malaysia. */
export const johorResponse: OpenWeatherResponse = {
  name: 'Johor',
  dt: 1661996460,
  sys: { country: 'MY' },
  weather: [{ id: 802, main: 'Clouds', description: 'scattered clouds', icon: '03d' }],
  main: { temp: 29.4, temp_min: 26.2, temp_max: 31.1, humidity: 58 },
};

/** Builds a minimal `Response` for stubbing `fetch`. */
export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
