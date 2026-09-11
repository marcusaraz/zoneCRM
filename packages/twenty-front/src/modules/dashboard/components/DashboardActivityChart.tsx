import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { type DashboardDay } from '@/dashboard/hooks/useDashboardCallSeries';

const StyledChart = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[4]};
`;

const StyledColumns = styled.div`
  align-items: flex-end;
  display: flex;
  gap: 2px;
  height: 140px;
`;

const StyledColumn = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 1px;
  height: 100%;
  justify-content: flex-end;
  min-width: 0;
  position: relative;

  &:hover > span {
    opacity: 0.75;
  }
`;

const StyledSegment = styled.span<{ height: number; tone: string }>`
  background: ${({ tone }) => tone};
  border-radius: 2px;
  display: block;
  height: ${({ height }) => height}%;
  transition: opacity ${themeCssVariables.animation.duration.fast} ease;
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
const OUTGOING_TONE = 'var(--t-tag-text-purple)';

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
