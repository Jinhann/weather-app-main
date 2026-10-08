const pad = (value: number): string => String(value).padStart(2, '0');

/** Formats a date in the user's local time as `DD-MM-YYYY hh:mma`, e.g. `01-09-2022 09:41am`. */
export function formatDateTime(date: Date): string {
  const hours24 = date.getHours();
  const hours12 = hours24 % 12 || 12;
  const meridiem = hours24 < 12 ? 'am' : 'pm';
  const day = `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()}`;
  return `${day} ${pad(hours12)}:${pad(date.getMinutes())}${meridiem}`;
}
