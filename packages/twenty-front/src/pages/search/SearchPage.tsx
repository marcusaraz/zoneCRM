import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { IconSearch } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { SearchPageInput } from '@/search-page/components/SearchPageInput';
import { SearchResultsView } from '@/search-page/components/SearchResultsView';
import { useSearchPageState } from '@/search-page/hooks/useSearchPageState';
import { PageCardHeader } from '@/ui/layout/page/components/PageCardHeader';
import { PageCardLayout } from '@/ui/layout/page/components/PageCardLayout';
import { PageTitle } from '@/ui/utilities/page-title/components/PageTitle';

const StyledScroll = styled.div`
  flex: 1;
  min-height: 0;
  overflow: auto;
  width: 100%;
`;

const StyledContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[5]};
  margin: 0 auto;
  max-width: 720px;
  padding: ${themeCssVariables.spacing[6]} ${themeCssVariables.spacing[4]}
    ${themeCssVariables.spacing[10]};
  width: 100%;
`;

/**
 * Search with the whole screen, for a phone and for a link.
 *
 * On a wide screen the box lives in the drawer and the results open beside
 * whatever is already open, so nobody arrives here by accident. This page is
 * what a narrow screen gets, where there is no drawer to type into, and what an
 * address with a search in it opens.
 */
export const SearchPage = () => {
  const { t } = useLingui();
  const { query, objectNameSingular, setQuery, setObjectNameSingular } =
    useSearchPageState();

  return (
    <PageCardLayout
      header={
        <PageCardHeader title={t`Search`} icon={<IconSearch size={16} />} />
      }
    >
      <PageTitle title={t`Search`} />
      <StyledScroll>
        <StyledContent>
          <SearchPageInput value={query} onChange={setQuery} />
          <SearchResultsView
            query={query}
            objectNameSingular={objectNameSingular}
            onSelectObject={setObjectNameSingular}
          />
        </StyledContent>
      </StyledScroll>
    </PageCardLayout>
  );
};

export default SearchPage;
