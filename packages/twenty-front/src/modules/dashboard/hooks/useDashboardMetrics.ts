import { useQuery } from '@apollo/client/react';
import { useMemo } from 'react';

import { DASHBOARD_QUERIES } from '@/dashboard/graphql/dashboardQueries';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';

type CountQueryKey = keyof typeof DASHBOARD_QUERIES;

const useCount = (
  queryKey: CountQueryKey,
  filter: Record<string, unknown>,
): number | null => {
  const apolloCoreClient = useApolloCoreClient();
  const { data } = useQuery(DASHBOARD_QUERIES[queryKey], {
    variables: { filter },
    client: apolloCoreClient,
    fetchPolicy: 'cache-and-network',
  });

  const connection = (
    data as Record<string, { totalCount?: number } | undefined> | undefined
  )?.[queryKey];

  return connection?.totalCount ?? null;
};

const isoSince = (hours: number) =>
  new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

/**
 * The numbers worth a glance before the day starts.
 *
 * How many customers there are, how many arrived and how many were touched, and
 * what the phone did. Everything is counted against a moment rather than a
 * calendar day, so "today" means the last twenty four hours wherever you are.
 */
export const useDashboardMetrics = () => {
  const since = useMemo(
    () => ({ day: isoSince(24), week: isoSince(24 * 7) }),
    [],
  );

  const peopleTotal = useCount('people', {});
  const companiesTotal = useCount('companies', {});
  const peopleAddedThisWeek = useCount('people', {
    createdAt: { gte: since.week },
  });
  const peopleTouchedToday = useCount('people', {
    updatedAt: { gte: since.day },
  });
  const peopleTouchedThisWeek = useCount('people', {
    updatedAt: { gte: since.week },
  });
  const callsThisWeek = useCount('phoneCalls', {
    occurredAt: { gte: since.week },
  });
  const callsToday = useCount('phoneCalls', {
    occurredAt: { gte: since.day },
  });
  const notesThisWeek = useCount('notes', { createdAt: { gte: since.week } });

  return {
    since,
    peopleTotal,
    companiesTotal,
    peopleAddedThisWeek,
    peopleTouchedToday,
    peopleTouchedThisWeek,
    callsThisWeek,
    callsToday,
    notesThisWeek,
  };
};
