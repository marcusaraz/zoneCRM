import { useQuery } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { useMemo } from 'react';

import { type DashboardChartSegment } from '@/dashboard/components/DashboardBarChart';
import { DASHBOARD_QUERIES } from '@/dashboard/graphql/dashboardQueries';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';

const OUTCOMES = [
  { key: 'ANSWERED', tone: 'var(--t-tag-text-green)' },
  { key: 'NO_ANSWER', tone: 'var(--t-tag-text-orange)' },
  { key: 'BUSY', tone: 'var(--t-tag-text-yellow)' },
  { key: 'FAILED', tone: 'var(--t-tag-text-red)' },
];

const useOutcomeCount = (status: string, since: string): number => {
  const apolloCoreClient = useApolloCoreClient();
  const { data } = useQuery(DASHBOARD_QUERIES.phoneCalls, {
    variables: {
      filter: {
        and: [{ occurredAt: { gte: since } }, { status: { eq: status } }],
      },
    },
    client: apolloCoreClient,
    fetchPolicy: 'cache-and-network',
  });

  return (
    (data as { phoneCalls?: { totalCount?: number } } | undefined)?.phoneCalls
      ?.totalCount ?? 0
  );
};

// What the phone did this week, in four words. The one worth opening is
// usually the second.
export const useDashboardCallOutcomes = (since: string) => {
  const { t } = useLingui();

  const answered = useOutcomeCount('ANSWERED', since);
  const noAnswer = useOutcomeCount('NO_ANSWER', since);
  const busy = useOutcomeCount('BUSY', since);
  const failed = useOutcomeCount('FAILED', since);

  const labels: Record<string, string> = useMemo(
    () => ({
      ANSWERED: t`Answered`,
      NO_ANSWER: t`Nobody picked up`,
      BUSY: t`Busy`,
      FAILED: t`Failed`,
    }),
    [t],
  );

  const counts: Record<string, number> = useMemo(
    () => ({
      ANSWERED: answered,
      NO_ANSWER: noAnswer,
      BUSY: busy,
      FAILED: failed,
    }),
    [answered, noAnswer, busy, failed],
  );

  const segments: DashboardChartSegment[] = useMemo(
    () =>
      OUTCOMES.map((outcome) => ({
        key: outcome.key,
        label: labels[outcome.key],
        count: counts[outcome.key],
        tone: outcome.tone,
      })),
    [counts, labels],
  );

  const filterForOutcome = (key: string | null) =>
    key === null
      ? null
      : { and: [{ occurredAt: { gte: since } }, { status: { eq: key } }] };

  return { segments, filterForOutcome };
};
