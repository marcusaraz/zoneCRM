import { currentUserState } from '@/auth/states/currentUserState';
import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { metadataStoreStatusFamilySelector } from '@/metadata-store/states/metadataStoreStatusFamilySelector';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { filterReadableActiveObjectMetadataItems } from '@/object-metadata/utils/filterReadableActiveObjectMetadataItems';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import isEmpty from 'lodash.isempty';
import { useMemo } from 'react';
import { AppPath, SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';

/**
 * Where signing in lands you.
 *
 * Zone CRM opens on the dashboard. It used to open on whichever list came first
 * in the menu, which meant arriving at four thousand contacts sorted by name:
 * an answer to a question nobody had asked.
 */
export const useDefaultHomePagePath = () => {
  const currentUser = useAtomStateValue(currentUserState);
  const isMobile = useIsMobile();
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();
  const metadataStore = useAtomFamilyStateValue(
    metadataStoreState,
    'objectMetadataItems',
  );
  const areObjectMetadataItemsLoaded = metadataStore.status === 'up-to-date';
  const navigationMenuItemsStatus = useAtomFamilySelectorValue(
    metadataStoreStatusFamilySelector,
    'navigationMenuItems',
  );
  const areNavigationMenuItemsLoaded =
    navigationMenuItemsStatus === 'up-to-date';

  const { activeObjectMetadataItems } = useFilteredObjectMetadataItems();

  const readableNonSystemObjectMetadataItems = useMemo(
    () =>
      filterReadableActiveObjectMetadataItems(
        activeObjectMetadataItems,
        objectPermissionsByObjectMetadataId,
      ).filter((item) => !item.isSystem),
    [activeObjectMetadataItems, objectPermissionsByObjectMetadataId],
  );

  const defaultHomePagePath = useMemo(() => {
    if (!isDefined(currentUser)) {
      return AppPath.SignInUp;
    }

    if (isMobile) {
      return AppPath.Home;
    }

    // Both stores are transiently empty during the post-login window, and a
    // workspace with nothing readable in it still has to land somewhere.
    if (!areObjectMetadataItemsLoaded || !areNavigationMenuItemsLoaded) {
      return AppPath.Index;
    }

    if (isEmpty(readableNonSystemObjectMetadataItems)) {
      return getSettingsPath(SettingsPath.ProfilePage);
    }

    return AppPath.DashboardPage;
  }, [
    currentUser,
    isMobile,
    readableNonSystemObjectMetadataItems,
    areObjectMetadataItemsLoaded,
    areNavigationMenuItemsLoaded,
  ]);

  return { defaultHomePagePath };
};
