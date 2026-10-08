import { describe, expect, it } from 'vitest';
import { getWeatherIllustration } from './weatherIllustration';

describe('getWeatherIllustration', () => {
  it.each([
    ['Clear', 800],
    ['Clouds', 801],
    ['Clouds', 802],
  ])('picks the sun for %s (%i)', (condition, id) => {
    expect(getWeatherIllustration(condition, id)).toBe('sun');
  });

  it.each([
    ['Clouds', 803],
    ['Clouds', 804],
    ['Rain', 500],
    ['Snow', 600],
  ])('picks the cloud for %s (%i)', (condition, id) => {
    expect(getWeatherIllustration(condition, id)).toBe('cloud');
  });
});
