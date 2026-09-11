import { useMemo, useState } from 'react';

const DAY_IN_MS = 24 * 60 * 60 * 1000;

export type DashboardPeriodDays = 7 | 30;

/**
 * The stretch of time the whole page is about, and the one before it.
 *
 * Every number on the page is shown against the same length of time that came
 * immediately before, because a count on its own says nothing about whether
 * things are getting better.
 */
export const useDashboardPeriod = () => {
  const [days, setDays] = useState<DashboardPeriodDays>(7);

  const period = useMemo(() => {
    const now = Date.now();

    return {
      days,
      // Fixed when the page opens. Reading the clock during a render makes
      // every render ask a different question, and a query whose variables
      // never settle refetches for as long as the page is open.
      until: new Date(now).toISOString(),
      since: new Date(now - days * DAY_IN_MS).toISOString(),
      previousSince: new Date(now - 2 * days * DAY_IN_MS).toISOString(),
      lastDay: new Date(now - DAY_IN_MS).toISOString(),
    };
  }, [days]);

  return { period, days, setDays };
};
