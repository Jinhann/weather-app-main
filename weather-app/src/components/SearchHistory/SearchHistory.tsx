import { useWeather } from '../../context/weather/useWeather';
import { SearchHistoryItem } from '../SearchHistoryItem/SearchHistoryItem';
import './SearchHistory.css';

/** Newest-first list of previous searches. */
export function SearchHistory() {
  const { history, searchAgain, removeHistoryEntry } = useWeather();

  return (
    <section className="search-history" aria-labelledby="history-heading">
      <h2 id="history-heading" className="search-history__heading">
        Search History
      </h2>
      {history.length === 0 ? (
        <p className="search-history__empty">No Record</p>
      ) : (
        <ol className="search-history__list">
          {history.map((entry) => (
            <SearchHistoryItem
              key={entry.id}
              entry={entry}
              onSearchAgain={searchAgain}
              onDelete={removeHistoryEntry}
            />
          ))}
        </ol>
      )}
    </section>
  );
}
