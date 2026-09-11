import { styled } from '@linaria/react';
import { IconArrowDown, IconArrowUp, IconMinus } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { type DashboardDelta } from '@/dashboard/utils/getDashboardDelta';

const StyledCard = styled.div`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[4]};
`;

const StyledLabel = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
  letter-spacing: 0.02em;
  text-transform: uppercase;
`;

const StyledFigure = styled.div`
  align-items: baseline;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledValue = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.xxl};
  font-variant-numeric: tabular-nums;
  font-weight: ${themeCssVariables.font.weight.semiBold};
  line-height: 1.1;
`;

const StyledDelta = styled.span<{ direction: DashboardDelta['direction'] }>`
  align-items: center;
  color: ${({ direction }) =>
    direction === 'up'
      ? 'var(--t-tag-text-green)'
      : direction === 'down'
        ? 'var(--t-tag-text-red)'
        : themeCssVariables.font.color.light};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  font-variant-numeric: tabular-nums;
  gap: 2px;
`;

const StyledHint = styled.span`
  color: ${themeCssVariables.font.color.light};
  font-size: ${themeCssVariables.font.size.sm};
`;

type DashboardKpiCardProps = {
  label: string;
  value: number | null;
  delta?: DashboardDelta | null;
  hint?: string;
};

// The number, how it moved, and what it is measured against. A count with
// nothing to compare it to tells you the size of something, not how it is going.
export const DashboardKpiCard = ({
  label,
  value,
  delta,
  hint,
}: DashboardKpiCardProps) => (
  <StyledCard>
    <StyledLabel>{label}</StyledLabel>
    <StyledFigure>
      <StyledValue>{value === null ? '—' : value.toLocaleString()}</StyledValue>
      {delta && (
        <StyledDelta direction={delta.direction}>
          {delta.direction === 'up' && <IconArrowUp size={12} />}
          {delta.direction === 'down' && <IconArrowDown size={12} />}
          {delta.direction === 'flat' && <IconMinus size={12} />}
          {delta.text}
        </StyledDelta>
      )}
    </StyledFigure>
    {hint !== undefined && <StyledHint>{hint}</StyledHint>}
  </StyledCard>
);
