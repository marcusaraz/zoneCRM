import { t } from '@lingui/core/macro';

// Zone CRM: what a date column can hold.
//
// The timeline used to say "about 5 hours ago" on the right of every row. In a
// fixed 88px column on the left that does not fit, and it was never the useful
// half: the exact time is a hover away, and what a timeline is read by is the
// day. Today and Yesterday by name, then the date.

export const shortDate = (
  happensAt: string,
  localeCatalog?: string,
): string => {
  const when = new Date(happensAt);

  if (Number.isNaN(when.getTime())) {
    return happensAt;
  }

  const midnight = new Date();
  midnight.setHours(0, 0, 0, 0);

  const days = Math.round(
    (midnight.getTime() - new Date(when).setHours(0, 0, 0, 0)) / 86400000,
  );

  if (days === 0) {
    return t`Today`;
  }

  if (days === 1) {
    return t`Yesterday`;
  }

  const locale = localeCatalog ?? undefined;

  // The year is only worth its width once it stops being obvious.
  return when.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'short',
    ...(when.getFullYear() === midnight.getFullYear()
      ? {}
      : { year: 'numeric' }),
  });
};
