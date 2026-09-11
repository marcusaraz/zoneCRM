import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { IconLayoutDashboard } from 'twenty-ui/icon';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { DashboardList } from '@/dashboard/components/DashboardList';
import { DashboardMetricTile } from '@/dashboard/components/DashboardMetricTile';
import { useDashboardLists } from '@/dashboard/hooks/useDashboardLists';
import { useDashboardMetrics } from '@/dashboard/hooks/useDashboardMetrics';
import { PageCardHeader } from '@/ui/layout/page/components/PageCardHeader';
import { PageCardLayout } from '@/ui/layout/page/components/PageCardLayout';
import { PageTitle } from '@/ui/utilities/page-title/components/PageTitle';

const StyledScroll = styled.div`
  flex: 1;
  min-height: 0;
  overflow: auto;
  width: 100%;
`;

const StyledContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[6]};
  padding: ${themeCssVariables.spacing[6]} ${themeCssVariables.spacing[6]}
    ${themeCssVariables.spacing[10]};
  width: 100%;
`;

const StyledTiles = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[3]};
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
`;

const StyledLists = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[4]};
  grid-template-columns: 1fr 1fr;

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    grid-template-columns: 1fr;
  }
`;

/**
 * What the CRM opens on.
 *
 * It used to open on the contact list, which answers no question anyone arrives
 * with. This answers the ones they do: how big the book is, what moved in it,
 * what the phone did, and who is still waiting to be called back.
 */
export const DashboardPage = () => {
  const { t } = useLingui();
  const metrics = useDashboardMetrics();
  const { recentlyTouched, callsToReturn } = useDashboardLists({
    since: metrics.since,
  });

  return (
    <PageCardLayout
      header={
        <PageCardHeader
          title={t`Dashboard`}
          icon={<IconLayoutDashboard size={16} />}
        />
      }
    >
      <PageTitle title={t`Dashboard`} />
      <StyledScroll>
        <StyledContent>
          <StyledTiles>
            <DashboardMetricTile
              label={t`Customers`}
              value={metrics.peopleTotal}
              hint={t`${metrics.companiesTotal ?? 0} companies`}
            />
            <DashboardMetricTile
              label={t`Added this week`}
              value={metrics.peopleAddedThisWeek}
            />
            <DashboardMetricTile
              label={t`Touched today`}
              value={metrics.peopleTouchedToday}
              hint={t`${metrics.peopleTouchedThisWeek ?? 0} this week`}
            />
            <DashboardMetricTile
              label={t`Calls this week`}
              value={metrics.callsThisWeek}
              hint={t`${metrics.callsToday ?? 0} in the last day`}
            />
            <DashboardMetricTile
              label={t`Notes written this week`}
              value={metrics.notesThisWeek}
            />
          </StyledTiles>

          <StyledLists>
            <DashboardList
              heading={t`Waiting for a call back`}
              rows={callsToReturn}
              emptyText={t`Nobody called and went unanswered this week.`}
            />
            <DashboardList
              heading={t`Recently worked on`}
              rows={recentlyTouched}
              emptyText={t`No customer records changed this week.`}
            />
          </StyledLists>
        </StyledContent>
      </StyledScroll>
    </PageCardLayout>
  );
};

export default DashboardPage;
