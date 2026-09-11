/**
 * How long a customer has gone untouched, in the bands worth telling apart.
 *
 * `days` is the age at which a customer falls out of the band above and into
 * this one. The last band has no floor: it is everyone older than the one
 * before it.
 */
export const DASHBOARD_STALENESS_BUCKETS = [
  { key: 'week', days: 7, tone: 'var(--t-tag-text-green)' },
  { key: 'month', days: 30, tone: 'var(--t-tag-text-blue)' },
  { key: 'quarter', days: 90, tone: 'var(--t-tag-text-yellow)' },
  { key: 'year', days: 365, tone: 'var(--t-tag-text-orange)' },
  { key: 'older', days: null, tone: 'var(--t-tag-text-red)' },
] as const;
