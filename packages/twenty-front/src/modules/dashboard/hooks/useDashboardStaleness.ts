import { useQuery } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { useMemo } from 'react';

import { type DashboardChartSegment } from '@/dashboard/components/DashboardBarChart';
import { DASHBOARD_STALENESS_BUCKETS } from '@/dashboard/constants/DashboardStalenessBuckets';
import { DASHBOARD_QUERIES } from '@/dashboard/graphql/dashboardQueries';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';

const isoAge = (days: number) =>
  new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

const useOlderThan = (days: number | null): number => {
  const apolloCoreClient = useApolloCoreClient();
  const { data } = useQuery(DASHBOARD_QUERIES.people, {
    variables:
      days === null ? {} : { filter: { updatedAt: { lt: isoAge(days) } } },
    client: apolloCoreClient,
    fetchPolicy: 'cache-and-network',
  });

  return (
    (data as { people?: { totalCount?: number } } | undefined)?.people
      ?.totalCount ?? 0
  );
};

/**
 * Customers grouped by how long they have gone untouched.
 *
 * The API wants one operator per field, so a band cannot be asked for directly.
 * Each threshold is counted on its own and the bands are the differences
 * between them, which is one query per line on the chart and no arithmetic on
 * the server.
 */
export const useDashboardStaleness = (total: number | null) => {
  const { t } = useLingui();

  const olderThanWeek = useOlderThan(7);
  const olderThanMonth = useOlderThan(30);
  const olderThanQuarter = useOlderThan(90);
  const olderThanYear = useOlderThan(365);

  const labels: Record<string, string> = useMemo(
    () => ({
      week: t`Within a week`,
      month: t`A week to a month`,
      quarter: t`One to three months`,
      year: t`Three months to a year`,
      older: t`Over a year`,
    }),
    [t],
  );

  const counts: Record<string, number> = useMemo(
    () => ({
      week: Math.max((total ?? 0) - olderThanWeek, 0),
      month: Math.max(olderThanWeek - olderThanMonth, 0),
      quarter: Math.max(olderThanMonth - olderThanQuarter, 0),
      year: Math.max(olderThanQuarter - olderThanYear, 0),
      older: olderThanYear,
    }),
    [total, olderThanWeek, olderThanMonth, olderThanQuarter, olderThanYear],
  );

  const segments: DashboardChartSegment[] = useMemo(
    () =>
      DASHBOARD_STALENESS_BUCKETS.map((bucket) => ({
        key: bucket.key,
        label: labels[bucket.key],
        count: counts[bucket.key],
        tone: bucket.tone,
      })),
    [counts, labels],
  );

  // What to ask for when one of the bands is opened. A band has both a floor
  // and a ceiling, and a field takes one operator at a time, so the two halves
  // are combined rather than nested.
  const filterForBucket = (key: string | null) => {
    if (key === null) {
      return null;
    }

    const index = DASHBOARD_STALENESS_BUCKETS.findIndex(
      (bucket) => bucket.key === key,
    );
    const bucket = DASHBOARD_STALENESS_BUCKETS[index];
    const previous = DASHBOARD_STALENESS_BUCKETS[index - 1];

    const newerThan =
      previous === undefined
        ? null
        : { updatedAt: { lt: isoAge(previous.days as number) } };
    const olderThan =
      bucket.days === null ? null : { updatedAt: { gte: isoAge(bucket.days) } };

    const clauses = [newerThan, olderThan].filter((clause) => clause !== null);

    return clauses.length === 1 ? clauses[0] : { and: clauses };
  };

  return { segments, filterForBucket };
};
