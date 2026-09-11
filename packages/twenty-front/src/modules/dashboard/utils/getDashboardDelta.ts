export type DashboardDelta = {
  direction: 'up' | 'down' | 'flat';
  text: string;
};

/**
 * How this stretch compares with the one before it.
 *
 * Growth from nothing is not a percentage anyone can read, so a period that
 * starts from zero is described in plain counts instead.
 */
export const getDashboardDelta = (
  current: number | null,
  previous: number | null,
): DashboardDelta | null => {
  if (current === null || previous === null) {
    return null;
  }

  const difference = current - previous;

  if (difference === 0) {
    return { direction: 'flat', text: 'no change' };
  }

  const sign = difference > 0 ? '+' : '−';
  const size = Math.abs(difference);

  if (previous === 0) {
    return {
      direction: difference > 0 ? 'up' : 'down',
      text: `${sign}${size}`,
    };
  }

  const percentage = Math.round((Math.abs(difference) / previous) * 100);

  return {
    direction: difference > 0 ? 'up' : 'down',
    text: `${sign}${percentage}%`,
  };
};
