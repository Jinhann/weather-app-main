import cloudImage from '../../assets/cloud.png';
import sunImage from '../../assets/sun.png';
import { getWeatherIllustration } from '../../utils/weatherIllustration';
import type { WeatherIllustrationKey } from '../../utils/weatherIllustration';

interface WeatherIllustrationProps {
  /** Main condition group, e.g. "Clouds". */
  condition: string;
  /** OpenWeather condition id. */
  conditionId: number;
  className?: string;
}

const IMAGES: Record<WeatherIllustrationKey, string> = { sun: sunImage, cloud: cloudImage };

/** Sun or rain cloud for the condition. Decorative: the condition is also text. */
export function WeatherIllustration({ condition, conditionId, className }: WeatherIllustrationProps) {
  const src = IMAGES[getWeatherIllustration(condition, conditionId)];
  return <img className={className} src={src} alt="" />;
}
