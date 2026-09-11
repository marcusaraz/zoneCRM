import { useQuery } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { useMemo } from 'react';

import { type DashboardChartSegment } from '@/dashboard/components/DashboardBarChart';
import { DASHBOARD_LEAD_STAGES } from '@/dashboard/constants/DashboardLeadStages';
import { DASHBOARD_QUERIES } from '@/dashboard/graphql/dashboardQueries';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';

const useStageCount = (stage: string): number => {
  const apolloCoreClient = useApolloCoreClient();
  const { data } = useQuery(DASHBOARD_QUERIES.people, {
    variables: { filter: { leadStatus: { eq: stage } } },
    client: apolloCoreClient,
    fetchPolicy: 'cache-and-network',
  });

  return (
    (data as { people?: { totalCount?: number } } | undefined)?.people
      ?.totalCount ?? 0
  );
};

/**
 * Where everyone stands, from a first name on a list to a signed customer.
 *
 * This is the one number a CRM exists to answer, so it gets the ring: a count
 * per stage says how many, a ring says what the book is made of.
 */
export const useDashboardPipeline = () => {
  const { t } = useLingui();

  const lead = useStageCount('LEAD');
  const informed = useStageCount('INFORMED');
  const opportunity = useStageCount('OPPORTUNITY');
  const contract = useStageCount('CONTRACT');
  const customer = useStageCount('CUSTOMER');
  const churn = useStageCount('CHURN');
  const optOut = useStageCount('OPT_OUT');

  const labels: Record<string, string> = useMemo(
    () => ({
      LEAD: t`Lead`,
      INFORMED: t`Informed`,
      OPPORTUNITY: t`Opportunity`,
      CONTRACT: t`Contract`,
      CUSTOMER: t`Customer`,
      CHURN: t`Churned`,
      OPT_OUT: t`Opted out`,
    }),
    [t],
  );

  const counts: Record<string, number> = useMemo(
    () => ({
      LEAD: lead,
      INFORMED: informed,
      OPPORTUNITY: opportunity,
      CONTRACT: contract,
      CUSTOMER: customer,
      CHURN: churn,
      OPT_OUT: optOut,
    }),
    [lead, informed, opportunity, contract, customer, churn, optOut],
  );

  const segments: DashboardChartSegment[] = useMemo(
    () =>
      DASHBOARD_LEAD_STAGES.map((stage) => ({
        key: stage.key,
        label: labels[stage.key],
        count: counts[stage.key],
        tone: stage.tone,
      })).filter((segment) => segment.count > 0),
    [counts, labels],
  );

  const filterForStage = (key: string | null) =>
    key === null ? null : { leadStatus: { eq: key } };

  return { segments, filterForStage };
};
