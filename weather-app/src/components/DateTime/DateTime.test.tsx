import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DateTime } from './DateTime';

describe('DateTime', () => {
  it('renders a semantic <time> with the formatted text and an ISO dateTime attribute', () => {
    const value = new Date(2022, 8, 1, 9, 41);
    render(<DateTime value={value} className="when" />);

    const element = screen.getByText('01-09-2022 09:41am');
    expect(element.tagName).toBe('TIME');
    expect(element).toHaveAttribute('datetime', value.toISOString());
    expect(element).toHaveClass('when');
  });
});
