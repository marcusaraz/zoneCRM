import { styled } from '@linaria/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { PAGE_BAR_MIN_HEIGHT } from '@/ui/layout/page/constants/PageBarMinHeight';
import { MultiWorkspaceDropdownButton } from '@/ui/navigation/navigation-drawer/components/MultiWorkspaceDropdown/MultiWorkspaceDropdownButton';
import { useIsNavigationDrawerContentExpanded } from '@/navigation/hooks/useIsNavigationDrawerContentExpanded';
import { NavigationDrawerCollapseButton } from './NavigationDrawerCollapseButton';

const StyledContainer = styled.div<{ isExpanded: boolean }>`
  align-items: ${({ isExpanded }) => (isExpanded ? 'center' : 'flex-start')};
  display: flex;
  flex-direction: ${({ isExpanded }) => (isExpanded ? 'row' : 'column')};
  flex-shrink: 0;
  gap: ${({ isExpanded }) => (isExpanded ? '0' : themeCssVariables.spacing[4])};
  min-height: ${PAGE_BAR_MIN_HEIGHT}px;
  padding-right: ${themeCssVariables.spacing[2]};
  transition: gap calc(${themeCssVariables.animation.duration.normal} * 1s) ease;
  user-select: none;

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    padding-left: ${themeCssVariables.spacing[5]};
    padding-right: ${themeCssVariables.spacing[5]};
  }
`;

const StyledRightActions = styled.div<{ isExpanded: boolean }>`
  align-items: center;
  align-self: ${({ isExpanded }) => (isExpanded ? 'auto' : 'flex-end')};
  display: flex;
  flex-direction: ${({ isExpanded }) => (isExpanded ? 'row' : 'column')};
  flex-shrink: 0;
  gap: ${({ isExpanded }) =>
    isExpanded ? '2px' : themeCssVariables.spacing[1]};
  margin-left: ${({ isExpanded }) => (isExpanded ? 'auto' : '0')};
  transition: gap calc(${themeCssVariables.animation.duration.normal} * 1s) ease;
`;

const StyledNavigationDrawerCollapseButtonContainer = styled.div`
  > * {
    height: ${themeCssVariables.spacing[6]};
    padding-right: 0;
    width: ${themeCssVariables.spacing[6]};
  }

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    > * {
      height: ${themeCssVariables.spacing[8]};
      padding-right: 0;
      width: ${themeCssVariables.spacing[8]};
    }
  }
`;

const StyledFooter = styled.div`
  align-items: center;
  border-top: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  flex-shrink: 0;
  margin-top: auto;
  padding-right: ${themeCssVariables.spacing[2]};
  padding-top: ${themeCssVariables.spacing[2]};
  user-select: none;

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    padding-left: ${themeCssVariables.spacing[5]};
    padding-right: ${themeCssVariables.spacing[5]};
  }
`;

const StyledWorkspaceDropdownContainer = styled.div`
  align-items: center;
  display: flex;
  flex: 1 1 auto;
  min-height: ${themeCssVariables.spacing[8]};
  min-width: 0;
`;

type NavigationDrawerHeaderProps = {
  showCollapseButton: boolean;
  // Zone CRM: the workspace sits at the foot of the sidebar, as it does on the
  // Stitch screens and as it does in the applications this is meant to feel
  // like. What belongs at the top is what people came for, which is the first
  // navigation item, not the name of the company they already know they work
  // for. The collapse button stays at the top, where the thing it collapses
  // begins.
  showWorkspace?: boolean;
};

export const NavigationDrawerHeader = ({
  showCollapseButton,
  showWorkspace = true,
}: NavigationDrawerHeaderProps) => {
  const isExpanded = useIsNavigationDrawerContentExpanded();

  return (
    <StyledContainer isExpanded={isExpanded}>
      {showWorkspace && (
        <StyledWorkspaceDropdownContainer>
          <MultiWorkspaceDropdownButton />
        </StyledWorkspaceDropdownContainer>
      )}
      <StyledRightActions isExpanded={isExpanded}>
        {isExpanded && showCollapseButton && (
          <StyledNavigationDrawerCollapseButtonContainer>
            <NavigationDrawerCollapseButton direction="left" />
          </StyledNavigationDrawerCollapseButtonContainer>
        )}
      </StyledRightActions>
    </StyledContainer>
  );
};

// The same button, at the foot of the drawer. A second workspace under one
// account becomes a choice here rather than a badge at the top.
export const NavigationDrawerWorkspaceFooter = () => (
  <StyledFooter>
    <StyledWorkspaceDropdownContainer>
      <MultiWorkspaceDropdownButton />
    </StyledWorkspaceDropdownContainer>
  </StyledFooter>
);
