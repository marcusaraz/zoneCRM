import { useQuery } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { useMemo } from 'react';
import { AppPath } from 'twenty-shared/types';
import { getAppPath } from 'twenty-shared/utils';

import { type DashboardListRow } from '@/dashboard/components/DashboardList';
import {
  DASHBOARD_CALL_LIST,
  DASHBOARD_PEOPLE_LIST,
} from '@/dashboard/graphql/dashboardQueries';
import {
  fullNameOf,
  pathToPerson,
  timeAgo,
} from '@/dashboard/utils/dashboardRows';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';

type PersonNode = {
  id: string;
  slug?: string | null;
  updatedAt?: string | null;
  name?: { firstName?: string | null; lastName?: string | null } | null;
  company?: { name?: string | null } | null;
};

type CallNode = {
  id: string;
  occurredAt?: string | null;
  phoneNumber?: string | null;
  direction?: string | null;
  person?: {
    id: string;
    slug?: string | null;
    name?: { firstName?: string | null; lastName?: string | null } | null;
  } | null;
};

/**
 * The records behind the bar that was clicked.
 *
 * Nothing is asked for until a bar is opened, and only the first handful is
 * asked for then: the point is to start somewhere, not to reproduce the list
 * page underneath a chart.
 */
export const useDashboardDrilldown = ({
  peopleFilter,
  callFilter,
}: {
  peopleFilter: Record<string, unknown> | null;
  callFilter: Record<string, unknown> | null;
}) => {
  const { t } = useLingui();
  const apolloCoreClient = useApolloCoreClient();

  const { data: peopleData } = useQuery(DASHBOARD_PEOPLE_LIST, {
    variables: { filter: peopleFilter ?? {} },
    client: apolloCoreClient,
    skip: peopleFilter === null,
    fetchPolicy: 'cache-and-network',
  });

  const { data: callData } = useQuery(DASHBOARD_CALL_LIST, {
    variables: { filter: callFilter ?? {} },
    client: apolloCoreClient,
    skip: callFilter === null,
    fetchPolicy: 'cache-and-network',
  });

  const peopleRows: DashboardListRow[] = useMemo(() => {
    const edges =
      (
        peopleData as
          | { people?: { edges?: { node: PersonNode }[] } }
          | undefined
      )?.people?.edges ?? [];

    return edges.map(({ node }) => ({
      id: node.id,
      to: pathToPerson(node),
      primary: fullNameOf(node.name) || node.company?.name || t`Unnamed`,
      secondary: timeAgo(node.updatedAt),
    }));
  }, [peopleData, t]);

  const callRows: DashboardListRow[] = useMemo(() => {
    const edges =
      (
        callData as
          | { phoneCalls?: { edges?: { node: CallNode }[] } }
          | undefined
      )?.phoneCalls?.edges ?? [];

    return edges.map(({ node }) => {
      const name = fullNameOf(node.person?.name);
      const number = node.phoneNumber ?? '';

      return {
        id: node.id,
        to: node.person
          ? pathToPerson(node.person)
          : getAppPath(AppPath.RecordIndexPage, { objectNamePlural: 'people' }),
        // A number the CRM does not know is worth saying out loud: it is
        // somebody who called and is not in the book yet.
        primary: name !== '' ? name : `${number} · ${t`not in the CRM`}`,
        secondary: timeAgo(node.occurredAt),
      };
    });
  }, [callData, t]);

  return { peopleRows, callRows };
};
