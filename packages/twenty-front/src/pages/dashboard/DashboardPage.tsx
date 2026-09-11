import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { IconLayoutDashboard } from 'twenty-ui/icon';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { DashboardActivityChart } from '@/dashboard/components/DashboardActivityChart';
import { DashboardBarChart } from '@/dashboard/components/DashboardBarChart';
import { DashboardHeader } from '@/dashboard/components/DashboardHeader';
import { DashboardKpiCard } from '@/dashboard/components/DashboardKpiCard';
import { DashboardList } from '@/dashboard/components/DashboardList';
import { useDashboardCallOutcomes } from '@/dashboard/hooks/useDashboardCallOutcomes';
import { useDashboardCallSeries } from '@/dashboard/hooks/useDashboardCallSeries';
import { useDashboardDrilldown } from '@/dashboard/hooks/useDashboardDrilldown';
import { useDashboardKpis } from '@/dashboard/hooks/useDashboardKpis';
import { useDashboardPeriod } from '@/dashboard/hooks/useDashboardPeriod';
import { useDashboardStaleness } from '@/dashboard/hooks/useDashboardStaleness';
import { PageCardHeader } from '@/ui/layout/page/components/PageCardHeader';
import { PageCardLayout } from '@/ui/layout/page/components/PageCardLayout';
import { PageTitle } from '@/ui/utilities/page-title/components/PageTitle';

const StyledScroll = styled.div`
  background: ${themeCssVariables.background.secondary};
  flex: 1;
  min-height: 0;
  overflow: auto;
  width: 100%;
`;

const StyledContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
  padding: ${themeCssVariables.spacing[5]} ${themeCssVariables.spacing[6]}
    ${themeCssVariables.spacing[10]};
  width: 100%;
`;

const StyledKpis = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[3]};
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
`;

const StyledSplit = styled.div`
  align-items: start;
  display: grid;
  gap: ${themeCssVariables.spacing[4]};
  grid-template-columns: 2fr 1fr;

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    grid-template-columns: 1fr;
  }
`;

const StyledPair = styled.div`
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
 * with. This answers the ones they do: how the book is growing, what the phone
 * did each day, who called and went unanswered, and who has been left alone too
 * long. Every number is set against the same stretch of time that came before
 * it, and every bar can be opened to see the records behind it.
 */
export const DashboardPage = () => {
  const { t } = useLingui();
  const { period, days, setDays } = useDashboardPeriod();

  const kpis = useDashboardKpis(period);
  const series = useDashboardCallSeries({ since: period.since, days });
  const staleness = useDashboardStaleness(kpis.peopleTotal);
  const callOutcomes = useDashboardCallOutcomes(period.since);

  const [openStalenessBucket, setOpenStalenessBucket] = useState<string | null>(
    null,
  );
  const [openCallOutcome, setOpenCallOutcome] = useState<string | null>(
    'NO_ANSWER',
  );

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
          <DashboardHeader days={days} onChangeDays={setDays} />

          <StyledKpis>
            <DashboardKpiCard
              label={t`Customers`}
              value={kpis.peopleTotal}
              hint={t`${kpis.companiesTotal ?? 0} companies`}
            />
            <DashboardKpiCard
              label={t`New customers`}
              value={kpis.peopleAdded}
              delta={kpis.peopleAddedDelta}
              hint={t`against the ${days} days before`}
            />
            <DashboardKpiCard
              label={t`Calls`}
              value={kpis.calls}
              delta={kpis.callsDelta}
              hint={t`against the ${days} days before`}
            />
            <DashboardKpiCard
              label={t`Notes written`}
              value={kpis.notes}
              delta={kpis.notesDelta}
              hint={t`against the ${days} days before`}
            />
          </StyledKpis>

          <StyledSplit>
            <StyledCard>
              <StyledCardHeading>{t`The phone, day by day`}</StyledCardHeading>
              <DashboardActivityChart days={series} />
            </StyledCard>

            <StyledCard>
              <StyledCardHeading>{t`How calls ended`}</StyledCardHeading>
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
          </StyledSplit>

          <StyledPair>
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
          </StyledPair>
        </StyledContent>
      </StyledScroll>
    </PageCardLayout>
  );
};

export default DashboardPage;
