import { useQuery } from '@apollo/client/react';
import { useMemo } from 'react';

import { DASHBOARD_CALL_SERIES } from '@/dashboard/graphql/dashboardQueries';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';

export type DashboardDay = {
  key: string;
  label: string;
  incoming: number;
  outgoing: number;
};

type CallNode = {
  id: string;
  occurredAt?: string | null;
  direction?: string | null;
};

const dayKey = (date: Date) => date.toISOString().slice(0, 10);

/**
 * The phone, day by day.
 *
 * One request brings the period back and the days are counted here, which is
 * one query instead of one per column, and leaves the numbers agreeing with
 * each other because they came from the same answer.
 */
export const useDashboardCallSeries = ({
  since,
  days,
}: {
  since: string;
  days: number;
}) => {
  const apolloCoreClient = useApolloCoreClient();

  const { data } = useQuery(DASHBOARD_CALL_SERIES, {
    variables: { filter: { occurredAt: { gte: since } } },
    client: apolloCoreClient,
    fetchPolicy: 'cache-and-network',
  });

  return useMemo<DashboardDay[]>(() => {
    const buckets = new Map<string, DashboardDay>();
    const today = new Date();

    for (let offset = days - 1; offset >= 0; offset--) {
      const date = new Date(today.getTime() - offset * 24 * 60 * 60 * 1000);

      buckets.set(dayKey(date), {
        key: dayKey(date),
        label: date.toLocaleDateString(undefined, {
          day: 'numeric',
          month: 'short',
        }),
        incoming: 0,
        outgoing: 0,
      });
    }

    const edges =
      (data as { phoneCalls?: { edges?: { node: CallNode }[] } } | undefined)
        ?.phoneCalls?.edges ?? [];

    for (const { node } of edges) {
      if (!node.occurredAt) {
        continue;
      }

      const bucket = buckets.get(dayKey(new Date(node.occurredAt)));

      if (bucket === undefined) {
        continue;
      }

      if (node.direction === 'OUTGOING') {
        bucket.outgoing += 1;
      } else {
        bucket.incoming += 1;
      }
    }

    return [...buckets.values()];
  }, [data, days]);
};
