/** Type guard that decides whether a parsed value has the expected shape. */
export type Validator<T> = (value: unknown) => value is T;

/** Reads JSON from localStorage; unavailable, corrupt or invalid data gives `fallback`. */
export function readStorage<T>(key: string, fallback: T, validate: Validator<T>): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    const parsed: unknown = JSON.parse(raw);
    return validate(parsed) ? parsed : fallback;
  } catch {
    // Storage unavailable or contains invalid JSON: behave as if empty.
    return fallback;
  }
}

/** Writes `value` to localStorage as JSON, ignoring storage errors. */
export function writeStorage<T>(key: string, value: T): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore quota or privacy-mode errors; the app keeps working in memory.
  }
}
