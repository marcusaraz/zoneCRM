import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import {
  StyledContainer,
  StyledIconChevronDown,
  StyledLabel,
  StyledLabelWrapper,
} from '@/ui/navigation/navigation-drawer/components/MultiWorkspaceDropdown/internal/MultiWorkspacesDropdownStyles';
import { NavigationDrawerAnimatedCollapseWrapper } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerAnimatedCollapseWrapper';
import { DEFAULT_WORKSPACE_LOGO } from '@/ui/navigation/navigation-drawer/constants/DefaultWorkspaceLogo';
import { useIsNavigationDrawerContentExpanded } from '@/navigation/hooks/useIsNavigationDrawerContentExpanded';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';
import { styled } from '@linaria/react';
import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { Avatar } from 'twenty-ui/data-display';
import { ThemeContext } from 'twenty-ui/theme-constants';

// The mark is a way home, the way a mark usually is. The name and the chevron
// beside it still open the workspace menu, so nothing is lost by giving the
// mark a job of its own.
const StyledHomeLink = styled(Link)`
  align-items: center;
  display: flex;
  flex-shrink: 0;
`;

type MultiWorkspaceDropdownClickableComponentProps = {
  disabled?: boolean;
  shouldHideLabel?: boolean;
};

export const MultiWorkspaceDropdownClickableComponent = ({
  disabled,
  shouldHideLabel = false,
}: MultiWorkspaceDropdownClickableComponentProps) => {
  const { theme } = useContext(ThemeContext);
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);

  const isNavigationDrawerExpanded = useIsNavigationDrawerContentExpanded();
  return (
    <StyledContainer
      data-testid="workspace-dropdown"
      isNavigationDrawerExpanded={isNavigationDrawerExpanded}
      disabled={disabled}
    >
      <StyledHomeLink
        to={AppPath.DashboardPage}
        aria-label={currentWorkspace?.displayName ?? ''}
        onClick={(event) => event.stopPropagation()}
      >
        <Avatar
          placeholder={currentWorkspace?.displayName || ''}
          avatarUrl={getAbsoluteImageUrl(
            currentWorkspace?.logo ?? DEFAULT_WORKSPACE_LOGO,
          )}
        />
      </StyledHomeLink>
      {!shouldHideLabel && (
        <>
          <StyledLabelWrapper>
            <NavigationDrawerAnimatedCollapseWrapper>
              <StyledLabel>{currentWorkspace?.displayName ?? ''}</StyledLabel>
            </NavigationDrawerAnimatedCollapseWrapper>
          </StyledLabelWrapper>
          <NavigationDrawerAnimatedCollapseWrapper>
            <StyledIconChevronDown
              size={theme.icon.size.md}
              stroke={theme.icon.stroke.sm}
            />
          </NavigationDrawerAnimatedCollapseWrapper>
        </>
      )}
    </StyledContainer>
  );
};
