import { describe, expect, it, vi } from 'vitest';
import { readStorage, writeStorage } from './storage';

const isNumber = (value: unknown): value is number => typeof value === 'number';

describe('readStorage', () => {
  it('returns the fallback when nothing is stored', () => {
    expect(readStorage('k', 7, isNumber)).toBe(7);
  });

  it('returns a stored value that passes validation', () => {
    window.localStorage.setItem('k', '42');
    expect(readStorage('k', 7, isNumber)).toBe(42);
  });

  it('returns the fallback for corrupt JSON', () => {
    window.localStorage.setItem('k', '{not json');
    expect(readStorage('k', 7, isNumber)).toBe(7);
  });

  it('returns the fallback for a value of the wrong shape', () => {
    window.localStorage.setItem('k', '"text"');
    expect(readStorage('k', 7, isNumber)).toBe(7);
  });

  it('returns the fallback when storage throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('denied');
    });
    expect(readStorage('k', 7, isNumber)).toBe(7);
  });
});

describe('writeStorage', () => {
  it('stores the value as JSON', () => {
    writeStorage('k', { a: 1 });
    expect(window.localStorage.getItem('k')).toBe('{"a":1}');
  });

  it('does not throw when storage throws', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota');
    });
    expect(() => writeStorage('k', 1)).not.toThrow();
  });
});
