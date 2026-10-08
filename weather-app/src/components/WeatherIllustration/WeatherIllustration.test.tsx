import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import cloudImage from '../../assets/cloud.png';
import sunImage from '../../assets/sun.png';
import { WeatherIllustration } from './WeatherIllustration';

function renderImage(condition: string, conditionId: number, className?: string) {
  const { container } = render(
    <WeatherIllustration condition={condition} conditionId={conditionId} className={className} />,
  );
  const image = container.querySelector('img');
  expect(image).toHaveAttribute('alt', '');
  return image;
}

describe('WeatherIllustration', () => {
  it('renders the sun image for a clear sky', () => {
    expect(renderImage('Clear', 800)).toHaveAttribute('src', sunImage);
  });

  it('renders the cloud image for rain', () => {
    expect(renderImage('Rain', 500)).toHaveAttribute('src', cloudImage);
  });

  it('passes the class name through', () => {
    expect(renderImage('Clear', 800, 'art')).toHaveClass('art');
  });
});
