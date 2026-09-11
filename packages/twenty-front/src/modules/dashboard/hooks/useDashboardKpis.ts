import { useQuery } from '@apollo/client/react';

import { DASHBOARD_QUERIES } from '@/dashboard/graphql/dashboardQueries';
import { getDashboardDelta } from '@/dashboard/utils/getDashboardDelta';
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

  return (
    (data as Record<string, { totalCount?: number } | undefined> | undefined)?.[
      queryKey
    ]?.totalCount ?? null
  );
};

// Everything counted twice: this stretch of time, and the one before it.
const between = (from: string, to: string) => ({
  and: [{ createdAt: { gte: from } }, { createdAt: { lt: to } }],
});

const callsBetween = (from: string, to: string) => ({
  and: [{ occurredAt: { gte: from } }, { occurredAt: { lt: to } }],
});

export const useDashboardKpis = ({
  since,
  previousSince,
  until,
}: {
  since: string;
  previousSince: string;
  until: string;
}) => {
  const peopleTotal = useCount('people', {});
  const companiesTotal = useCount('companies', {});

  const peopleAdded = useCount('people', between(since, until));
  const peopleAddedBefore = useCount('people', between(previousSince, since));

  const calls = useCount('phoneCalls', callsBetween(since, until));
  const callsBefore = useCount(
    'phoneCalls',
    callsBetween(previousSince, since),
  );

  const notes = useCount('notes', between(since, until));
  const notesBefore = useCount('notes', between(previousSince, since));

  return {
    peopleTotal,
    companiesTotal,
    peopleAdded,
    peopleAddedDelta: getDashboardDelta(peopleAdded, peopleAddedBefore),
    calls,
    callsDelta: getDashboardDelta(calls, callsBefore),
    notes,
    notesDelta: getDashboardDelta(notes, notesBefore),
  };
};
