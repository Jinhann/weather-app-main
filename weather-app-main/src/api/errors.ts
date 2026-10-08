export type WeatherApiErrorKind =
  | 'not-found'
  | 'invalid-api-key'
  | 'rate-limited'
  | 'network'
  | 'missing-api-key'
  | 'unknown';

/** Single source of truth for user-facing error text. */
const ERROR_MESSAGES: Record<WeatherApiErrorKind, string> = {
  'not-found': 'Not found. Please check the city and country names.',
  'invalid-api-key': 'The weather service rejected the API key. Please check the configuration.',
  'rate-limited': 'Too many requests. Please wait a moment and try again.',
  network: 'Unable to reach the weather service. Check your connection and try again.',
  'missing-api-key':
    'The weather API key is missing. Set VITE_OPENWEATHER_API_KEY in your .env file.',
  unknown: 'Something went wrong while fetching the weather. Please try again.',
};

/** Error thrown by the weather API layer; `kind` says what went wrong. */
export class WeatherApiError extends Error {
  readonly kind: WeatherApiErrorKind;

  constructor(kind: WeatherApiErrorKind) {
    super(kind);
    this.name = 'WeatherApiError';
    this.kind = kind;
  }
}

/** The user-facing message for an error kind. */
export const getErrorMessage = (kind: WeatherApiErrorKind): string => ERROR_MESSAGES[kind];

/** True when a fetch was cancelled through an AbortController. */
export const isAbortError = (error: unknown): boolean =>
  error instanceof DOMException && error.name === 'AbortError';
