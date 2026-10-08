import { forwardRef, useId } from 'react';
import type { InputHTMLAttributes } from 'react';
import './TextField.css';

export interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Visible label, linked to the input. */
  label: string;
}

/**
 * Labelled text input. Any native input prop (value, onChange, aria-*, ...) is passed
 * through, and the ref points at the `<input>` so callers can focus it.
 */
export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, id, className, type = 'text', ...inputProps },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const classes = ['text-field', className].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      <label className="text-field__label" htmlFor={inputId}>
        {label}
      </label>
      <input ref={ref} id={inputId} type={type} className="text-field__input" {...inputProps} />
    </div>
  );
});
