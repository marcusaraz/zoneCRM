import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { IconLayoutDashboard } from 'twenty-ui/icon';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { DashboardActivityChart } from '@/dashboard/components/DashboardActivityChart';
import { DashboardBarChart } from '@/dashboard/components/DashboardBarChart';
import { DashboardCardBoundary } from '@/dashboard/components/DashboardCardBoundary';
import { DashboardDonut } from '@/dashboard/components/DashboardDonut';
import { DashboardHeader } from '@/dashboard/components/DashboardHeader';
import { DashboardKpiCard } from '@/dashboard/components/DashboardKpiCard';
import { DashboardList } from '@/dashboard/components/DashboardList';
import { useDashboardCallOutcomes } from '@/dashboard/hooks/useDashboardCallOutcomes';
import { useDashboardCallSeries } from '@/dashboard/hooks/useDashboardCallSeries';
import { useDashboardDrilldown } from '@/dashboard/hooks/useDashboardDrilldown';
import { useDashboardKpis } from '@/dashboard/hooks/useDashboardKpis';
import { useDashboardOpportunities } from '@/dashboard/hooks/useDashboardOpportunities';
import { useDashboardOwners } from '@/dashboard/hooks/useDashboardOwners';
import { useDashboardPeriod } from '@/dashboard/hooks/useDashboardPeriod';
import { useDashboardPipeline } from '@/dashboard/hooks/useDashboardPipeline';
import { useDashboardStaleness } from '@/dashboard/hooks/useDashboardStaleness';
import { formatMoney } from '@/dashboard/utils/formatMoney';
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
  margin: 0 auto;
  max-width: 1180px;
  padding: ${themeCssVariables.spacing[8]} ${themeCssVariables.spacing[6]}
    ${themeCssVariables.spacing[12]};
  width: 100%;
`;

const StyledKpis = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[4]};
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
`;

const StyledSplit = styled.div`
  align-items: start;
  display: grid;
  gap: ${themeCssVariables.spacing[4]};
  grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    grid-template-columns: 1fr;
  }
`;

// A surface that sits on the page rather than being drawn onto it: no outline,
// a soft shadow, and a corner round enough to feel like an object.
const StyledCard = styled.section`
  background: ${themeCssVariables.background.primary};
  border-radius: ${themeCssVariables.border.radius.lg};
  box-shadow: ${themeCssVariables.boxShadow.light};
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const StyledCardHeading = styled.h2`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.lg};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  letter-spacing: -0.01em;
  margin: 0;
  padding: ${themeCssVariables.spacing[5]} ${themeCssVariables.spacing[6]} 0;
`;

const StyledDrilldown = styled.div`
  padding: 0 ${themeCssVariables.spacing[4]} ${themeCssVariables.spacing[4]};
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
  const staleness = useDashboardStaleness({
    total: kpis.peopleTotal,
    until: period.until,
  });
  const callOutcomes = useDashboardCallOutcomes(period.since);
  const pipeline = useDashboardPipeline();
  const owners = useDashboardOwners();
  const deals = useDashboardOpportunities({ since: period.since });

  const [openStalenessBucket, setOpenStalenessBucket] = useState<string | null>(
    null,
  );
  const [openCallOutcome, setOpenCallOutcome] = useState<string | null>(
    'NO_ANSWER',
  );
  const [openStage, setOpenStage] = useState<string | null>(null);
  const [openOwner, setOpenOwner] = useState<string | null>(null);
  const [openDealStage, setOpenDealStage] = useState<string | null>(null);

  const { peopleRows, callRows } = useDashboardDrilldown({
    peopleFilter: staleness.filterForBucket(openStalenessBucket),
    callFilter: callOutcomes.filterForOutcome(openCallOutcome),
  });

  // Each chart opens its own list, so one being open does not close another.
  const { peopleRows: stageRows } = useDashboardDrilldown({
    peopleFilter: pipeline.filterForStage(openStage),
    callFilter: null,
  });

  const { peopleRows: ownerRows } = useDashboardDrilldown({
    peopleFilter: owners.filterForOwner(openOwner),
    callFilter: null,
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
              label={t`Open pipeline`}
              value={Math.round(deals.openValue)}
              display={formatMoney(deals.openValue)}
              hint={t`${deals.openCount} deals still running`}
            />
            <DashboardKpiCard
              label={t`Completed`}
              value={Math.round(deals.closedValueInPeriod)}
              display={formatMoney(deals.closedValueInPeriod)}
              hint={t`in the last ${days} days`}
            />
          </StyledKpis>

          <StyledSplit>
            <DashboardCardBoundary>
              <StyledCard>
                <StyledCardHeading>{t`The pipeline, by what it is worth`}</StyledCardHeading>
                <DashboardBarChart
                  segments={deals.segments}
                  selectedKey={openDealStage}
                  onSelect={setOpenDealStage}
                />
                {openDealStage !== null && (
                  <StyledDrilldown>
                    <DashboardList
                      heading={t`Largest first`}
                      rows={deals.listForStage(openDealStage)}
                      emptyText={t`No deal sits at this stage.`}
                    />
                  </StyledDrilldown>
                )}
              </StyledCard>
            </DashboardCardBoundary>

            <DashboardCardBoundary>
              <StyledCard>
                <StyledCardHeading>{t`Where everyone stands`}</StyledCardHeading>
                <DashboardDonut
                  segments={pipeline.segments}
                  selectedKey={openStage}
                  onSelect={setOpenStage}
                  centreLabel={t`with a stage`}
                />
                {openStage !== null && (
                  <StyledDrilldown>
                    <DashboardList
                      heading={t`Longest untouched first`}
                      rows={stageRows}
                      emptyText={t`Nobody is at this stage.`}
                    />
                  </StyledDrilldown>
                )}
              </StyledCard>
            </DashboardCardBoundary>
          </StyledSplit>

          <StyledSplit>
            <DashboardCardBoundary>
              <StyledCard>
                <StyledCardHeading>{t`Who is carrying the book`}</StyledCardHeading>
                <DashboardBarChart
                  segments={owners.segments}
                  selectedKey={openOwner}
                  onSelect={setOpenOwner}
                />
                {openOwner !== null && (
                  <StyledDrilldown>
                    <DashboardList
                      heading={t`Longest untouched first`}
                      rows={ownerRows}
                      emptyText={t`Nobody is assigned to them.`}
                    />
                  </StyledDrilldown>
                )}
              </StyledCard>
            </DashboardCardBoundary>

            <DashboardCardBoundary>
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
            </DashboardCardBoundary>
          </StyledSplit>

          {/* The phone is worth a glance, not the top of the page. */}
          <StyledSplit>
            <DashboardCardBoundary>
              <StyledCard>
                <StyledCardHeading>{t`The phone, day by day`}</StyledCardHeading>
                <DashboardActivityChart days={series} />
              </StyledCard>
            </DashboardCardBoundary>

            <DashboardCardBoundary>
              <StyledCard>
                <StyledCardHeading>{t`How calls ended`}</StyledCardHeading>
                <DashboardDonut
                  segments={callOutcomes.segments}
                  selectedKey={openCallOutcome}
                  onSelect={setOpenCallOutcome}
                  centreLabel={t`calls`}
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
            </DashboardCardBoundary>
          </StyledSplit>
        </StyledContent>
      </StyledScroll>
    </PageCardLayout>
  );
};

export default DashboardPage;
