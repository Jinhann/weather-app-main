import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { TextField } from './TextField';

describe('TextField', () => {
  it('links the visible label to the input', () => {
    render(<TextField label="City" />);
    expect(screen.getByLabelText('City')).toHaveAttribute('type', 'text');
  });

  it('passes native input props through', async () => {
    const onChange = vi.fn();
    render(<TextField label="City" name="city" aria-invalid onChange={onChange} />);
    const input = screen.getByLabelText('City');
    expect(input).toHaveAttribute('name', 'city');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    await userEvent.type(input, 'a');
    expect(onChange).toHaveBeenCalled();
  });

  it('forwards the ref to the input element', () => {
    const ref = createRef<HTMLInputElement>();
    render(<TextField label="City" ref={ref} />);
    expect(ref.current).toBe(screen.getByLabelText('City'));
  });
});
