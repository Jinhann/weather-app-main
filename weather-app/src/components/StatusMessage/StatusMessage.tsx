import type { ReactNode } from 'react';
import './StatusMessage.css';

interface StatusMessageProps {
  children: ReactNode;
}

/** Error banner, announced immediately to screen readers via role="alert". */
export function StatusMessage({ children }: StatusMessageProps) {
  return (
    <div className="status-message" role="alert">
      {children}
    </div>
  );
}
