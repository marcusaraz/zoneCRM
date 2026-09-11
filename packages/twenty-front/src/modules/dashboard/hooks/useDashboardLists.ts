import { useQuery } from '@apollo/client/react';
import { useMemo } from 'react';
import { AppPath } from 'twenty-shared/types';
import { getAppPath } from 'twenty-shared/utils';

import {
  DASHBOARD_CALLS_TO_RETURN,
  DASHBOARD_RECENT_PEOPLE,
} from '@/dashboard/graphql/dashboardQueries';
import { type DashboardListRow } from '@/dashboard/components/DashboardList';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { getRecordSlugPath } from '@/object-record/record-show/utils/recordSlugRoutes';

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
  person?: {
    id: string;
    slug?: string | null;
    name?: { firstName?: string | null; lastName?: string | null } | null;
  } | null;
};

const fullNameOf = (
  name:
    | { firstName?: string | null; lastName?: string | null }
    | null
    | undefined,
): string =>
  [name?.firstName, name?.lastName]
    .filter((part) => part)
    .join(' ')
    .trim();

const pathToPerson = (person: { id: string; slug?: string | null }): string =>
  getRecordSlugPath('person', person.slug ?? '') ??
  getAppPath(AppPath.RecordShowPage, {
    objectNameSingular: 'person',
    objectRecordId: person.id,
  });

// How long ago, in the shortest true form. A day old reads as a day, not as
// twenty six hours.
const timeAgo = (value: string | null | undefined): string => {
  if (!value) {
    return '';
  }

  const minutes = Math.round((Date.now() - new Date(value).getTime()) / 60000);

  if (minutes < 60) {
    return `${Math.max(minutes, 1)}m`;
  }

  const hours = Math.round(minutes / 60);

  return hours < 24 ? `${hours}h` : `${Math.round(hours / 24)}d`;
};

export const useDashboardLists = ({ since }: { since: { week: string } }) => {
  const apolloCoreClient = useApolloCoreClient();

  const { data: peopleData } = useQuery(DASHBOARD_RECENT_PEOPLE, {
    variables: { filter: { updatedAt: { gte: since.week } } },
    client: apolloCoreClient,
    fetchPolicy: 'cache-and-network',
  });

  const { data: callsData } = useQuery(DASHBOARD_CALLS_TO_RETURN, {
    variables: {
      filter: {
        occurredAt: { gte: since.week },
        direction: { eq: 'INCOMING' },
        status: { eq: 'NO_ANSWER' },
      },
    },
    client: apolloCoreClient,
    fetchPolicy: 'cache-and-network',
  });

  const recentlyTouched: DashboardListRow[] = useMemo(() => {
    const edges =
      (
        peopleData as
          | { people?: { edges?: { node: PersonNode }[] } }
          | undefined
      )?.people?.edges ?? [];

    return edges.map(({ node }) => ({
      id: node.id,
      to: pathToPerson(node),
      primary: fullNameOf(node.name) || node.company?.name || '—',
      secondary: timeAgo(node.updatedAt),
    }));
  }, [peopleData]);

  const callsToReturn: DashboardListRow[] = useMemo(() => {
    const edges =
      (
        callsData as
          | { phoneCalls?: { edges?: { node: CallNode }[] } }
          | undefined
      )?.phoneCalls?.edges ?? [];

    return edges.map(({ node }) => ({
      id: node.id,
      to: node.person
        ? pathToPerson(node.person)
        : getAppPath(AppPath.RecordIndexPage, { objectNamePlural: 'people' }),
      primary: fullNameOf(node.person?.name) || node.phoneNumber || '—',
      secondary: timeAgo(node.occurredAt),
    }));
  }, [callsData]);

  return { recentlyTouched, callsToReturn };
};
