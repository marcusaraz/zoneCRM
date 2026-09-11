import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { IconLayoutDashboard } from 'twenty-ui/icon';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { DashboardBarChart } from '@/dashboard/components/DashboardBarChart';
import { DashboardList } from '@/dashboard/components/DashboardList';
import { DashboardMetricTile } from '@/dashboard/components/DashboardMetricTile';
import { useDashboardCallOutcomes } from '@/dashboard/hooks/useDashboardCallOutcomes';
import { useDashboardDrilldown } from '@/dashboard/hooks/useDashboardDrilldown';
import { useDashboardMetrics } from '@/dashboard/hooks/useDashboardMetrics';
import { useDashboardStaleness } from '@/dashboard/hooks/useDashboardStaleness';
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

const StyledCharts = styled.div`
  align-items: start;
  display: grid;
  gap: ${themeCssVariables.spacing[4]};
  grid-template-columns: 1fr 1fr;

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    grid-template-columns: 1fr;
  }
`;

const StyledCard = styled.section`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const StyledCardHeading = styled.h2`
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  margin: 0;
  padding: ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[4]};
`;

const StyledDrilldown = styled.div`
  border-top: 1px solid ${themeCssVariables.border.color.light};
`;

/**
 * What the CRM opens on.
 *
 * It used to open on the contact list, which answers no question anyone arrives
 * with. This answers the ones they do: how big the book is, what moved in it,
 * what the phone did, who has been left alone too long, and who called and went
 * unanswered. The bars are for seeing the shape; opening one is for doing
 * something about it.
 */
export const DashboardPage = () => {
  const { t } = useLingui();
  const metrics = useDashboardMetrics();

  const [openStalenessBucket, setOpenStalenessBucket] = useState<string | null>(
    null,
  );
  const [openCallOutcome, setOpenCallOutcome] = useState<string | null>(null);

  const staleness = useDashboardStaleness(metrics.peopleTotal);
  const callOutcomes = useDashboardCallOutcomes(metrics.since.week);

  const { peopleRows, callRows } = useDashboardDrilldown({
    peopleFilter: staleness.filterForBucket(openStalenessBucket),
    callFilter: callOutcomes.filterForOutcome(openCallOutcome),
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

          <StyledCharts>
            <StyledCard>
              <StyledCardHeading>{t`How long since anyone touched them`}</StyledCardHeading>
              <DashboardBarChart
                segments={staleness.segments}
                selectedKey={openStalenessBucket}
                onSelect={setOpenStalenessBucket}
              />
              {openStalenessBucket !== null && (
                <StyledDrilldown>
                  <DashboardList
                    heading={t`Longest untouched first`}
                    rows={peopleRows}
                    emptyText={t`Nobody falls in this band.`}
                  />
                </StyledDrilldown>
              )}
            </StyledCard>

            <StyledCard>
              <StyledCardHeading>{t`Calls this week`}</StyledCardHeading>
              <DashboardBarChart
                segments={callOutcomes.segments}
                selectedKey={openCallOutcome}
                onSelect={setOpenCallOutcome}
              />
              {openCallOutcome !== null && (
                <StyledDrilldown>
                  <DashboardList
                    heading={t`Most recent first`}
                    rows={callRows}
                    emptyText={t`No calls ended this way.`}
                  />
                </StyledDrilldown>
              )}
            </StyledCard>
          </StyledCharts>
        </StyledContent>
      </StyledScroll>
    </PageCardLayout>
  );
};

export default DashboardPage;
