import { SearchForm } from './components/SearchForm/SearchForm';
import { SearchHistory } from './components/SearchHistory/SearchHistory';
import { StatusMessage } from './components/StatusMessage/StatusMessage';
import { ThemeToggle } from './components/ThemeToggle/ThemeToggle';
import { WeatherCard } from './components/WeatherCard/WeatherCard';
import { useWeather } from './context/weather/useWeather';
import './App.css';

/** Page layout; the features read their own data from the weather context. */
export function App() {
  const { status, error } = useWeather();
  const isLoading = status === 'loading';

  return (
    <main className="app">
      <h1 className="visually-hidden">Weather search</h1>
      <div className="app__topbar">
        <SearchForm />
        <div className="app__theme-toggle">
          <ThemeToggle />
        </div>
      </div>

      {status === 'error' && <StatusMessage>{error}</StatusMessage>}

      {/*
        Loading is announced to screen readers only. A visible banner would push the
        panel down and back on every search; the Search button spinner and a delayed
        dim of the panel show progress without shifting the layout.
      */}
      <p className="visually-hidden" role="status">
        {isLoading ? 'Fetching the latest weather…' : ''}
      </p>

      <div className="app__panel" aria-busy={isLoading}>
        <WeatherCard />
        <SearchHistory />
      </div>
    </main>
  );
}
