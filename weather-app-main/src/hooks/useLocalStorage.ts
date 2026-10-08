import { useEffect, useReducer, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { readStorage, writeStorage } from '../utils/storage';
import type { Validator } from '../utils/storage';

/** Mirrors `value` to localStorage as JSON whenever it changes. */
function usePersistEffect<T>(key: string, value: T) {
  useEffect(() => {
    writeStorage(key, value);
  }, [key, value]);
}

/**
 * `useState` that is mirrored to localStorage as JSON.
 * Stored data is checked with `validate`; anything invalid falls back to `initial`.
 */
export function useLocalStorage<T>(
  key: string,
  initial: T,
  validate: Validator<T>,
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => readStorage(key, initial, validate));
  usePersistEffect(key, value);
  return [value, setValue];
}

/**
 * `useReducer` whose state is loaded from, and mirrored to, localStorage.
 * Same validation and error handling as `useLocalStorage`.
 */
export function usePersistentReducer<T, A>(
  reducer: (state: T, action: A) => T,
  key: string,
  initial: T,
  validate: Validator<T>,
): [T, Dispatch<A>] {
  const [state, dispatch] = useReducer(reducer, undefined, () =>
    readStorage(key, initial, validate),
  );
  usePersistEffect(key, state);
  return [state, dispatch];
}
