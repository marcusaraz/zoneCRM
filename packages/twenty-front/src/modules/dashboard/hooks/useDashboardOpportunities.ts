import { useQuery } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { useMemo } from 'react';

import { type DashboardChartSegment } from '@/dashboard/components/DashboardBarChart';
import { type DashboardListRow } from '@/dashboard/components/DashboardList';
import { DASHBOARD_OPPORTUNITY_STAGES } from '@/dashboard/constants/DashboardOpportunityStages';
import { DASHBOARD_OPPORTUNITIES } from '@/dashboard/graphql/dashboardQueries';
import { formatMoney } from '@/dashboard/utils/formatMoney';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { AppPath } from 'twenty-shared/types';
import { getAppPath } from 'twenty-shared/utils';

const CLOSED_STAGE = 'COMPLETION';

type OpportunityNode = {
  id: string;
  name?: string | null;
  stage?: string | null;
  createdAt?: string | null;
  closeDate?: string | null;
  amount?: {
    amountMicros?: number | string | null;
    currencyCode?: string | null;
  } | null;
};

const poundsOf = (node: OpportunityNode): number => {
  const micros = node.amount?.amountMicros;

  return micros === null || micros === undefined
    ? 0
    : Number(micros) / 1_000_000;
};

/**
 * The deals, their stage and what they are worth.
 *
 * One request brings the pipeline back and the sums are done here. The amounts
 * are the point: a stage with two deals in it can matter more than one with
 * twenty, and a count alone never says which.
 */
export const useDashboardOpportunities = ({ since }: { since: string }) => {
  const { t } = useLingui();
  const apolloCoreClient = useApolloCoreClient();

  const { data } = useQuery(DASHBOARD_OPPORTUNITIES, {
    client: apolloCoreClient,
    fetchPolicy: 'cache-and-network',
  });

  const labels: Record<string, string> = useMemo(
    () => ({
      RESEARCH_STAGE: t`Research`,
      HOT_DEAL: t`Hot deal`,
      OFFER_IN_PLACE: t`Offer in place`,
      MORTGAGE_OFFER: t`Mortgage offer`,
      PRE_PAYMENT: t`Pre payment`,
      CONVEYANCING: t`Conveyancing`,
      EXCHANGE_OF_CONTRACTS: t`Exchange of contracts`,
      COMPLETION: t`Completed`,
    }),
    [t],
  );

  return useMemo(() => {
    const nodes =
      (
        data as
          | { opportunities?: { edges?: { node: OpportunityNode }[] } }
          | undefined
      )?.opportunities?.edges?.map((edge) => edge.node) ?? [];

    const valueByStage = new Map<string, number>();
    const countByStage = new Map<string, number>();

    let openValue = 0;
    let openCount = 0;
    let closedValue = 0;
    let closedValueInPeriod = 0;
    let openedInPeriod = 0;

    for (const node of nodes) {
      const stage = node.stage ?? '';
      const pounds = poundsOf(node);

      valueByStage.set(stage, (valueByStage.get(stage) ?? 0) + pounds);
      countByStage.set(stage, (countByStage.get(stage) ?? 0) + 1);

      if (stage === CLOSED_STAGE) {
        closedValue += pounds;

        if ((node.closeDate ?? node.createdAt ?? '') >= since) {
          closedValueInPeriod += pounds;
        }
      } else {
        openValue += pounds;
        openCount += 1;
      }

      if ((node.createdAt ?? '') >= since) {
        openedInPeriod += 1;
      }
    }

    const segments: DashboardChartSegment[] = DASHBOARD_OPPORTUNITY_STAGES.map(
      (stage) => ({
        key: stage.key,
        label: labels[stage.key],
        count: Math.round(valueByStage.get(stage.key) ?? 0),
        tone: stage.tone,
        display: `${formatMoney(valueByStage.get(stage.key) ?? 0)} · ${countByStage.get(stage.key) ?? 0}`,
      }),
    ).filter((segment) => segment.count > 0);

    return {
      segments,
      countForStage: (key: string) => countByStage.get(key) ?? 0,
      openValue,
      openCount,
      closedValue,
      closedValueInPeriod,
      openedInPeriod,
      total: nodes.length,
      // The deals are already here, so opening a stage costs nothing.
      listForStage: (key: string | null): DashboardListRow[] =>
        key === null
          ? []
          : nodes
              .filter((node) => node.stage === key)
              .sort((first, second) => poundsOf(second) - poundsOf(first))
              .slice(0, 10)
              .map((node) => ({
                id: node.id,
                to: getAppPath(AppPath.RecordShowPage, {
                  objectNameSingular: 'opportunity',
                  objectRecordId: node.id,
                }),
                primary: node.name ?? t`Unnamed`,
                secondary: formatMoney(poundsOf(node)),
              })),
    };
  }, [data, labels, since]);
};
