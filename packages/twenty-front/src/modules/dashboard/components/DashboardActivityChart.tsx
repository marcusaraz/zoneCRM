import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { type DashboardDay } from '@/dashboard/hooks/useDashboardCallSeries';

const StyledChart = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[5]} ${themeCssVariables.spacing[6]}
    ${themeCssVariables.spacing[6]};
`;

const StyledPlot = styled.div`
  height: 260px;
  position: relative;
`;

// Four faint lines are enough to read a height against without drawing a grid.
const StyledGridLines = styled.div`
  display: flex;
  flex-direction: column;
  inset: 0;
  justify-content: space-between;
  pointer-events: none;
  position: absolute;

  span {
    background: ${themeCssVariables.border.color.light};
    display: block;
    height: 1px;
  }
`;

const StyledColumns = styled.div`
  align-items: flex-end;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  inset: 0;
  position: absolute;
`;

const StyledColumn = styled.div`
  border-radius: ${themeCssVariables.border.radius.sm}
    ${themeCssVariables.border.radius.sm} 0 0;
  display: flex;
  flex: 1;
  flex-direction: column;
  height: 100%;
  justify-content: flex-end;
  min-width: 0;
  overflow: hidden;
  transition: opacity ${themeCssVariables.animation.duration.fast} ease;

  &:hover {
    opacity: 0.75;
  }
`;

const StyledSegment = styled.span<{ height: number; tone: string }>`
  background: ${({ tone }) => tone};
  display: block;
  height: ${({ height }) => height}%;
  width: 100%;
`;

const StyledAxis = styled.div`
  color: ${themeCssVariables.font.color.light};
  display: flex;
  font-size: ${themeCssVariables.font.size.xs};
  justify-content: space-between;
`;

const StyledLegend = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[4]};
`;

const StyledLegendItem = styled.span`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledSwatch = styled.span<{ tone: string }>`
  background: ${({ tone }) => tone};
  border-radius: 2px;
  display: block;
  height: 8px;
  width: 8px;
`;

const INCOMING_TONE = 'var(--t-tag-text-blue)';
const OUTGOING_TONE = 'var(--t-accent-accent6)';

type DashboardActivityChartProps = {
  days: DashboardDay[];
};

// One column a day, incoming stacked on outgoing. The shape of a week's work
// is the thing worth seeing; the exact counts are a hover away.
export const DashboardActivityChart = ({
  days,
}: DashboardActivityChartProps) => {
  const { t } = useLingui();
  const busiest = Math.max(
    ...days.map((day) => day.incoming + day.outgoing),
    1,
  );

  return (
    <StyledChart>
      <StyledPlot>
        <StyledGridLines>
          <span />
          <span />
          <span />
          <span />
        </StyledGridLines>
        <StyledColumns>
          {days.map((day) => (
            <StyledColumn
              key={day.key}
              title={t`${day.label}: ${day.incoming} in, ${day.outgoing} out`}
            >
              <StyledSegment
                height={(day.outgoing / busiest) * 100}
                tone={OUTGOING_TONE}
              />
              <StyledSegment
                height={(day.incoming / busiest) * 100}
                tone={INCOMING_TONE}
              />
            </StyledColumn>
          ))}
        </StyledColumns>
      </StyledPlot>
      <StyledAxis>
        <span>{days[0]?.label}</span>
        <span>{days[days.length - 1]?.label}</span>
      </StyledAxis>
      <StyledLegend>
        <StyledLegendItem>
          <StyledSwatch tone={INCOMING_TONE} />
          {t`Incoming`}
        </StyledLegendItem>
        <StyledLegendItem>
          <StyledSwatch tone={OUTGOING_TONE} />
          {t`Outgoing`}
        </StyledLegendItem>
      </StyledLegend>
    </StyledChart>
  );
};
