/**
 * Money as it is spoken about, not as it is stored.
 *
 * A pipeline is discussed in millions and thousands, so that is how it is
 * written: nobody reads 1483000 as quickly as they read 1.5m.
 */
export const formatMoney = (pounds: number): string => {
  if (pounds >= 1_000_000) {
    return `£${(pounds / 1_000_000).toFixed(pounds >= 10_000_000 ? 0 : 1)}m`;
  }

  if (pounds >= 1_000) {
    return `£${Math.round(pounds / 1_000)}k`;
  }

  return `£${Math.round(pounds)}`;
};
