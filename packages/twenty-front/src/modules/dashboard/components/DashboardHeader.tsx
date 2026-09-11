import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { type DashboardPeriodDays } from '@/dashboard/hooks/useDashboardPeriod';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

const StyledHeader = styled.header`
  align-items: flex-end;
  display: flex;
  gap: ${themeCssVariables.spacing[4]};
  justify-content: space-between;
`;

const StyledGreeting = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledTitle = styled.h1`
  color: ${themeCssVariables.font.color.primary};
  font-size: 2.1rem;
  font-weight: ${themeCssVariables.font.weight.semiBold};
  letter-spacing: -0.02em;
  line-height: 1.1;
  margin: 0;
`;

const StyledDate = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.lg};
`;

const StyledSwitch = styled.div`
  background: ${themeCssVariables.background.tertiary};
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  flex-shrink: 0;
  gap: 2px;
  padding: 2px;
`;

const StyledSwitchButton = styled.button<{ isSelected: boolean }>`
  background: ${({ isSelected }) =>
    isSelected ? themeCssVariables.background.primary : 'transparent'};
  border: none;
  border-radius: ${themeCssVariables.border.radius.sm};
  box-shadow: ${({ isSelected }) =>
    isSelected ? themeCssVariables.boxShadow.light : 'none'};
  color: ${({ isSelected }) =>
    isSelected
      ? themeCssVariables.font.color.primary
      : themeCssVariables.font.color.tertiary};
  cursor: pointer;
  font-family: ${themeCssVariables.font.family};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[4]};

  &:focus-visible {
    outline: 2px solid ${themeCssVariables.border.color.blue};
    outline-offset: 1px;
  }
`;

type DashboardHeaderProps = {
  days: DashboardPeriodDays;
  onChangeDays: (days: DashboardPeriodDays) => void;
};

// Who is looking, what day it is, and how far back the page is counting. The
// last of those is the only control on the page, and everything obeys it.
export const DashboardHeader = ({
  days,
  onChangeDays,
}: DashboardHeaderProps) => {
  const { t } = useLingui();
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const firstName = currentWorkspaceMember?.name?.firstName ?? '';

  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <StyledHeader>
      <StyledGreeting>
        <StyledTitle>
          {firstName === '' ? t`Good day` : t`Good day, ${firstName}`}
        </StyledTitle>
        <StyledDate>{today}</StyledDate>
      </StyledGreeting>
      <StyledSwitch role="group" aria-label={t`Period`}>
        <StyledSwitchButton
          type="button"
          isSelected={days === 7}
          aria-pressed={days === 7}
          onClick={() => onChangeDays(7)}
        >
          {t`7 days`}
        </StyledSwitchButton>
        <StyledSwitchButton
          type="button"
          isSelected={days === 30}
          aria-pressed={days === 30}
          onClick={() => onChangeDays(30)}
        >
          {t`30 days`}
        </StyledSwitchButton>
      </StyledSwitch>
    </StyledHeader>
  );
};
