import type { Theme } from '../types/theme';

/** Type guard for values read back from storage. */
export const isTheme = (value: unknown): value is Theme => value === 'light' || value === 'dark';
