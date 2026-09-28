const dateFmt = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' });
export const formatDate = (iso: string) => dateFmt.format(new Date(iso));

const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });
export function timeAgo(iso: string) {
  const seconds = Math.round((new Date(iso).getTime() - Date.now()) / 1000);
  const steps: [Intl.RelativeTimeFormatUnit, number][] = [
    ['year', 31536000], ['month', 2592000], ['week', 604800], ['day', 86400], ['hour', 3600], ['minute', 60],
  ];
  for (const [unit, secs] of steps) if (Math.abs(seconds) >= secs) return rtf.format(Math.round(seconds / secs), unit);
  return 'just now';
}
