import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Spinner } from '../Spinner/Spinner';
import './Button.css';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  /** Optional icon shown before the label. */
  icon?: ReactNode;
  /** Shows a spinner, swaps the label for `loadingText` and disables the button. */
  loading?: boolean;
  loadingText?: ReactNode;
}

/**
 * Text button with primary/secondary styles and an optional loading state.
 * The normal and loading labels share one grid cell, so the button keeps the width
 * of the wider one and does not resize (and shift its neighbours) while loading.
 */
export function Button({
  variant = 'primary',
  icon,
  loading = false,
  loadingText,
  type = 'button',
  className,
  disabled,
  children,
  ...rest
}: ButtonProps) {
  const classes = ['button', `button--${variant}`, className].filter(Boolean).join(' ');

  return (
    <button type={type} className={classes} disabled={disabled || loading} {...rest}>
      <span className="button__layers">
        <span className="button__layer" aria-hidden={loading || undefined}>
          {icon}
          {children}
        </span>
        <span className="button__layer" aria-hidden={!loading || undefined}>
          <Spinner />
          {loadingText ?? children}
        </span>
      </span>
    </button>
  );
}
