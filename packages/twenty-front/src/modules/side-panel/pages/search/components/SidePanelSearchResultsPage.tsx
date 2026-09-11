import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { SearchResultsView } from '@/search-page/components/SearchResultsView';
import { sidePanelSearchObjectFilterState } from '@/side-panel/states/sidePanelSearchObjectFilterState';
import { sidePanelSearchState } from '@/side-panel/states/sidePanelSearchState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';

const StyledContent = styled.div`
  padding: ${themeCssVariables.spacing[3]} 0 ${themeCssVariables.spacing[6]};
`;

// The results of what is being typed in the drawer, beside the record that was
// already open. Nothing is left behind to come back to.
export const SidePanelSearchResultsPage = () => {
  const sidePanelSearch = useAtomStateValue(sidePanelSearchState);
  const sidePanelSearchObjectFilter = useAtomStateValue(
    sidePanelSearchObjectFilterState,
  );
  const setSidePanelSearchObjectFilter = useSetAtomState(
    sidePanelSearchObjectFilterState,
  );

  return (
    <ScrollWrapper componentInstanceId="side-panel-search-results">
      <StyledContent>
        <SearchResultsView
          query={sidePanelSearch}
          objectNameSingular={sidePanelSearchObjectFilter}
          onSelectObject={setSidePanelSearchObjectFilter}
        />
      </StyledContent>
    </ScrollWrapper>
  );
};
