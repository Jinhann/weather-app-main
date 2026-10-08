/** What the user typed into the search form. `country` may be empty. */
export interface SearchQuery {
  city: string;
  country: string;
}

/** Subset of the OpenWeather "Current weather" response that this app consumes. */
export interface OpenWeatherResponse {
  name: string;
  dt: number;
  sys: { country: string };
  weather: Array<{ id: number; main: string; description: string; icon: string }>;
  main: { temp: number; temp_min: number; temp_max: number; humidity: number };
}

/** Normalised weather data used throughout the UI (metric units). */
export interface WeatherReport {
  /** Canonical city name returned by the API. */
  city: string;
  /** ISO 3166-1 alpha-2 country code returned by the API. */
  countryCode: string;
  /** Main condition group, e.g. "Clouds". */
  condition: string;
  /** OpenWeather condition id, used to pick finer-grained illustrations. */
  conditionId: number;
  /** Human readable description, e.g. "scattered clouds". */
  description: string;
  iconCode: string;
  /** Degrees Celsius. */
  temperature: number;
  tempMin: number;
  tempMax: number;
  /** Relative humidity in percent. */
  humidity: number;
  /** Time the weather was observed by the station. */
  observedAt: Date;
}
