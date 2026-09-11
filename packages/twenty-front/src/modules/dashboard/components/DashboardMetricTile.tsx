import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledTile = styled.div`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  padding: ${themeCssVariables.spacing[4]};
`;

const StyledValue = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.xxl};
  font-variant-numeric: tabular-nums;
  font-weight: ${themeCssVariables.font.weight.semiBold};
  line-height: 1.1;
`;

const StyledLabel = styled.span`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.md};
`;

const StyledHint = styled.span`
  color: ${themeCssVariables.font.color.light};
  font-size: ${themeCssVariables.font.size.sm};
`;

type DashboardMetricTileProps = {
  label: string;
  value: number | null;
  hint?: string;
};

// A number, what it counts, and when it counts from. Nothing else fits in a
// glance.
export const DashboardMetricTile = ({
  label,
  value,
  hint,
}: DashboardMetricTileProps) => (
  <StyledTile>
    <StyledValue>{value === null ? '—' : value.toLocaleString()}</StyledValue>
    <StyledLabel>{label}</StyledLabel>
    {hint !== undefined && <StyledHint>{hint}</StyledHint>}
  </StyledTile>
);
