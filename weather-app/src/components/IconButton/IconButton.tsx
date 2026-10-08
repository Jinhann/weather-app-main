import type { ButtonHTMLAttributes, ReactNode } from 'react';
import './IconButton.css';

interface IconButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label' | 'title' | 'children'> {
  /** Accessible name; also shown as a tooltip. */
  label: string;
  children: ReactNode;
}

/** Round 34px button that contains only an icon. */
export function IconButton({
  label,
  children,
  className,
  type = 'button',
  ...rest
}: IconButtonProps) {
  const classes = className ? `icon-button ${className}` : 'icon-button';
  return (
    <button type={type} className={classes} aria-label={label} title={label} {...rest}>
      {children}
    </button>
  );
}
