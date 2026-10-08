/** Which illustration to show for a weather condition. */
export type WeatherIllustrationKey = 'sun' | 'cloud';

/** OpenWeather ids for "few clouds" and "scattered clouds": mostly sunny skies. */
const PARTLY_SUNNY_IDS = [801, 802];

/** Sun for clear/partly clear skies, rain cloud otherwise. */
export function getWeatherIllustration(
  condition: string,
  conditionId: number,
): WeatherIllustrationKey {
  const isSunny =
    condition === 'Clear' || (condition === 'Clouds' && PARTLY_SUNNY_IDS.includes(conditionId));
  return isSunny ? 'sun' : 'cloud';
}
