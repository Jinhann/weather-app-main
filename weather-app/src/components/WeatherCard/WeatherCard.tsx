import { useWeather } from '../../context/weather/useWeather';
import { DateTime } from '../DateTime/DateTime';
import { WeatherIllustration } from '../WeatherIllustration/WeatherIllustration';
import './WeatherCard.css';

const capitalise = (text: string): string => text.charAt(0).toUpperCase() + text.slice(1);
const formatDegrees = (value: number): string => `${Math.round(value)}°`;

/** "Today's Weather" panel, or a friendly empty state before the first search. */
export function WeatherCard() {
  const { report, searchedAt } = useWeather();

  if (!report || !searchedAt) {
    return (
      <section className="weather-card" aria-labelledby="weather-heading">
        <h2 id="weather-heading" className="weather-card__heading">
          Today&apos;s Weather
        </h2>
        <p className="weather-card__empty">Search for a city to see today&apos;s weather.</p>
      </section>
    );
  }

  return (
    <section className="weather-card" aria-labelledby="weather-heading">
      {/* Decorative: the condition is also written out as text below. */}
      <WeatherIllustration
        className="weather-card__illustration"
        condition={report.condition}
        conditionId={report.conditionId}
      />
      <h2 id="weather-heading" className="weather-card__heading">
        Today&apos;s Weather
      </h2>
      <p className="weather-card__temperature">{formatDegrees(report.temperature)}</p>
      <p className="weather-card__range">
        H: {formatDegrees(report.tempMax)} L: {formatDegrees(report.tempMin)}
      </p>
      <p className="weather-card__location">
        {report.city}, {report.countryCode}
      </p>
      <div className="weather-card__meta">
        <p>
          <DateTime value={searchedAt} />
        </p>
        <p>Humidity: {report.humidity}%</p>
        <p>
          {report.condition}
          <span className="weather-card__description">{capitalise(report.description)}</span>
        </p>
      </div>
    </section>
  );
}
