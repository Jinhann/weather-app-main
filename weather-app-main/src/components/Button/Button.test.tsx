import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Button } from './Button';

describe('Button', () => {
  it('defaults to a primary, non-submitting button', () => {
    render(<Button>Save</Button>);
    const button = screen.getByRole('button', { name: 'Save' });
    expect(button).toHaveAttribute('type', 'button');
    expect(button).toHaveClass('button', 'button--primary');
  });

  it('applies the secondary variant and calls onClick', async () => {
    const onClick = vi.fn();
    render(
      <Button variant="secondary" onClick={onClick}>
        Clear
      </Button>,
    );
    const button = screen.getByRole('button', { name: 'Clear' });
    expect(button).toHaveClass('button--secondary');
    await userEvent.click(button);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('shows the loading text and is disabled while loading', () => {
    render(
      <Button loading loadingText="Searching…">
        Search
      </Button>,
    );
    expect(screen.getByRole('button', { name: 'Searching…' })).toBeDisabled();
  });
});
