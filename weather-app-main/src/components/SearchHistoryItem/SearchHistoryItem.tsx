import type { HistoryEntry } from '../../types/history';
import { DateTime } from '../DateTime/DateTime';
import { IconButton } from '../IconButton/IconButton';
import { SearchIcon, TrashIcon } from '../icons/Icons';
import './SearchHistoryItem.css';

interface SearchHistoryItemProps {
  entry: HistoryEntry;
  onSearchAgain: (entry: HistoryEntry) => void;
  onDelete: (id: string) => void;
}

/** One history row with "search again" and "delete" actions. */
export function SearchHistoryItem({
  entry,
  onSearchAgain,
  onDelete,
}: SearchHistoryItemProps) {
  const location = `${entry.city}, ${entry.countryCode}`;

  return (
    <li className="history-item">
      <span className="history-item__location">{location}</span>
      <DateTime className="history-item__time" value={new Date(entry.searchedAt)} />
      <div className="history-item__actions">
        <IconButton
          label={`Search ${location} again`}
          onClick={() => onSearchAgain(entry)}
        >
          <SearchIcon />
        </IconButton>
        <IconButton label={`Delete ${location} from history`} onClick={() => onDelete(entry.id)}>
          <TrashIcon />
        </IconButton>
      </div>
    </li>
  );
}
