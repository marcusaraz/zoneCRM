import { useCallback } from 'react';
import { SidePanelPages } from 'twenty-shared/types';
import { IconSearch } from 'twenty-ui/icon';
import { t } from '@lingui/core/macro';
import { v4 } from 'uuid';

import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { sidePanelSearchObjectFilterState } from '@/side-panel/states/sidePanelSearchObjectFilterState';
import { sidePanelSearchState } from '@/side-panel/states/sidePanelSearchState';
import { sidePanelNavigationStackState } from '@/side-panel/states/sidePanelNavigationStackState';
import { isSidePanelOpenedState } from '@/side-panel/states/isSidePanelOpenedState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

/**
 * Typing puts the results on the right; emptying the box takes them away.
 *
 * The panel is only opened on the first letter. Opening it again on every
 * keystroke would reset the panel's own history and throw away whatever the
 * panel was showing before the search began.
 */
export const useOpenSearchResultsInSidePanel = () => {
  const { navigateSidePanelMenu, closeSidePanelMenu } = useSidePanelMenu();
  const setSidePanelSearch = useSetAtomState(sidePanelSearchState);
  const setSidePanelSearchObjectFilter = useSetAtomState(
    sidePanelSearchObjectFilterState,
  );
  const sidePanelNavigationStack = useAtomStateValue(
    sidePanelNavigationStackState,
  );
  const isSidePanelOpened = useAtomStateValue(isSidePanelOpenedState);

  const isShowingResults =
    isSidePanelOpened &&
    sidePanelNavigationStack.at(-1)?.page === SidePanelPages.SearchRecords;

  const search = useCallback(
    (nextQuery: string) => {
      setSidePanelSearch(nextQuery);

      if (nextQuery.trim() === '') {
        setSidePanelSearchObjectFilter(null);

        if (isShowingResults) {
          closeSidePanelMenu();
        }

        return;
      }

      if (isShowingResults) {
        return;
      }

      setSidePanelSearchObjectFilter(null);
      navigateSidePanelMenu({
        page: SidePanelPages.SearchRecords,
        pageTitle: t`Search`,
        pageIcon: IconSearch,
        pageId: v4(),
        resetNavigationStack: true,
      });
    },
    [
      closeSidePanelMenu,
      isShowingResults,
      navigateSidePanelMenu,
      setSidePanelSearch,
      setSidePanelSearchObjectFilter,
    ],
  );

  return { search };
};
