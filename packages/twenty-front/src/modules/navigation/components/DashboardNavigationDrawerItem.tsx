import { useLingui } from '@lingui/react/macro';
import { useLocation } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { IconLayoutDashboard } from 'twenty-ui/icon';

import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';

/**
 * The way back to the first screen.
 *
 * The mark at the top of the drawer goes there too, but a mark is something you
 * learn rather than something you see, and the dashboard is where the day
 * starts. It sits above the objects because it is not one of them.
 */
export const DashboardNavigationDrawerItem = () => {
  const { t } = useLingui();
  const location = useLocation();

  return (
    <NavigationDrawerItem
      label={t`Dashboard`}
      to={AppPath.DashboardPage}
      Icon={IconLayoutDashboard}
      active={location.pathname === AppPath.DashboardPage}
    />
  );
};
