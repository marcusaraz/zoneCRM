import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { themeCssVariables } from 'twenty-ui/theme-constants';

// The list always sits inside a card, so it brings no frame of its own.
const StyledSection = styled.section`
  display: flex;
  flex-direction: column;
`;

const StyledHeading = styled.h3`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  letter-spacing: 0.04em;
  margin: 0;
  padding: ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[4]}
    ${themeCssVariables.spacing[1]};
  text-transform: uppercase;
`;

const StyledRow = styled(Link)`
  align-items: baseline;
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  font-size: ${themeCssVariables.font.size.md};
  gap: ${themeCssVariables.spacing[2]};
  justify-content: space-between;
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[4]};
  text-decoration: none;

  &:last-of-type {
    border-bottom: none;
  }

  &:hover {
    background: ${themeCssVariables.background.tertiary};
  }
`;

const StyledPrimary = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledSecondary = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  flex-shrink: 0;
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledEmpty = styled.p`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.md};
  margin: 0;
  padding: ${themeCssVariables.spacing[4]};
`;

export type DashboardListRow = {
  id: string;
  to: string;
  primary: string;
  secondary: string;
};

type DashboardListProps = {
  heading: ReactNode;
  rows: DashboardListRow[];
  emptyText: string;
};

// A short list that is worth acting on, where every line goes somewhere.
export const DashboardList = ({
  heading,
  rows,
  emptyText,
}: DashboardListProps) => (
  <StyledSection>
    <StyledHeading>{heading}</StyledHeading>
    {rows.length === 0 && <StyledEmpty>{emptyText}</StyledEmpty>}
    {rows.map((row) => (
      <StyledRow key={row.id} to={row.to}>
        <StyledPrimary>{row.primary}</StyledPrimary>
        <StyledSecondary>{row.secondary}</StyledSecondary>
      </StyledRow>
    ))}
  </StyledSection>
);
