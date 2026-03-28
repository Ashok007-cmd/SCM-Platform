/**
 * Formatting utilities for the SCM Platform UI.
 */

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat('en-US');

const compactFormatter = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

/** Format a number as USD currency, e.g. $1,234,567 */
export function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

/** Format a number with thousands separators, e.g. 1,234,567 */
export function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

/** Format a number in compact notation, e.g. 1.2M, 45K */
export function formatCompact(value: number): string {
  return compactFormatter.format(value);
}

/** Format a decimal as a percentage string, e.g. 0.1234 → "12.3%" */
export function formatPercent(value: number, decimals = 1): string {
  return (value * 100).toFixed(decimals) + '%';
}

/** Format an ISO date string to a locale date, e.g. "Mar 28, 2026" */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/** Format an ISO datetime string to a locale datetime */
export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Return a human-readable relative time string, e.g. "2 hours ago" */
export function formatRelativeTime(iso: string): string {
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diff / 60_000);
  if (Math.abs(minutes) < 60) return rtf.format(-minutes, 'minute');
  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return rtf.format(-hours, 'hour');
  const days = Math.round(hours / 24);
  return rtf.format(-days, 'day');
}
