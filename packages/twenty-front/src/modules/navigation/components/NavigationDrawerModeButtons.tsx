import { styled } from '@linaria/react';
import { useContext } from 'react';
import { LightIconButton } from 'twenty-ui/input';
import { ThemeContext } from 'twenty-ui/theme-constants';

import { useActiveNavigationDrawerMode } from '@/navigation/hooks/useActiveNavigationDrawerMode';
import { useNavigationDrawerModes } from '@/navigation/hooks/useNavigationDrawerModes';
import { useSwitchNavigationDrawerMode } from '@/navigation/hooks/useSwitchNavigationDrawerMode';

const StyledButtons = styled.div`
  align-items: center;
  display: flex;
  gap: 2px;
`;

/**
 * Ask the assistant, or open the settings.
 *
 * These used to be a row of tabs under the workspace name, with Home beside
 * them: three tabs for two places and a third that was already the mark at the
 * top. They are two corner buttons now, which is where a phone and a desktop
 * both keep the things that are not the page you are on.
 */
export const NavigationDrawerModeButtons = () => {
  const { theme } = useContext(ThemeContext);
  const modes = useNavigationDrawerModes();
  const activeNavigationDrawerMode = useActiveNavigationDrawerMode();
  const { switchNavigationDrawerMode } = useSwitchNavigationDrawerMode();

  if (modes.length === 0) {
    return null;
  }

  return (
    <StyledButtons>
      {modes.map(({ Icon, label, mode }) => (
        <LightIconButton
          key={mode}
          Icon={Icon}
          size="small"
          accent={
            mode === activeNavigationDrawerMode ? 'tertiary' : 'secondary'
          }
          aria-label={label}
          aria-current={mode === activeNavigationDrawerMode}
          onClick={() => switchNavigationDrawerMode(mode)}
        />
      ))}
    </StyledButtons>
  );
};
