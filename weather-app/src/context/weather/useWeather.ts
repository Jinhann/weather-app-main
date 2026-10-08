import { useContext } from 'react';
import { WeatherContext } from './WeatherContext';
import type { WeatherContextValue } from './WeatherContext';

/** Access the weather state and actions; must be used inside `WeatherProvider`. */
export function useWeather(): WeatherContextValue {
  const context = useContext(WeatherContext);
  if (!context) {
    throw new Error('useWeather must be used within a WeatherProvider');
  }
  return context;
}
