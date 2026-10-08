import { formatDateTime } from '../../utils/formatDateTime';

interface DateTimeProps {
  value: Date;
  className?: string;
}

/** Semantic `<time>` element showing a date as `DD-MM-YYYY hh:mma`. */
export function DateTime({ value, className }: DateTimeProps) {
  return (
    <time className={className} dateTime={value.toISOString()}>
      {formatDateTime(value)}
    </time>
  );
}
