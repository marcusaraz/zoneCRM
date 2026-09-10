import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { getAppPath } from 'twenty-shared/utils';
import { IconSearch } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { SearchPageEmptyState } from '@/search-page/components/SearchPageEmptyState';
import { SearchPageFilters } from '@/search-page/components/SearchPageFilters';
import { SearchPageInput } from '@/search-page/components/SearchPageInput';
import { SearchPageResults } from '@/search-page/components/SearchPageResults';
import { SearchPageSkeleton } from '@/search-page/components/SearchPageSkeleton';
import { useSearchPageResults } from '@/search-page/hooks/useSearchPageResults';
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

const StyledControls = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
`;

/**
 * Search, given the whole screen.
 *
 * It used to live in the right panel, a column narrow enough that a name and the
 * kind of record it belongs to had to take turns. Here the results are grouped,
 * countable and addressable, and the keyboard never has to leave the box: the
 * arrows walk the list while the words stay editable.
 */
export const SearchPage = () => {
  const { t } = useLingui();
  const navigate = useNavigate();
  const { query, objectNameSingular, setQuery, setObjectNameSingular } =
    useSearchPageState();

  const { groups, results, counts, totalCount, loading, hasQuery, noResults } =
    useSearchPageResults({ query, objectNameSingular });

  const [highlightedIndex, setHighlightedIndex] = useState(0);

  // A new set of results starts at the top rather than wherever the last one
  // happened to be.
  useEffect(() => {
    setHighlightedIndex(0);
  }, [query, objectNameSingular]);

  const moveHighlight = (offset: number) => {
    if (results.length === 0) {
      return;
    }

    setHighlightedIndex((previous) => {
      const next = previous + offset;

      if (next < 0) {
        return results.length - 1;
      }

      if (next > results.length - 1) {
        return 0;
      }

      return next;
    });
  };

  const getResultPath = (result: (typeof results)[number]) =>
    getAppPath(AppPath.RecordShowPage, {
      objectNameSingular: result.objectNameSingular,
      objectRecordId: result.recordId,
    });

  const openHighlighted = () => {
    const result = results[highlightedIndex];

    if (result !== undefined) {
      // Enter follows the same address the highlighted row points at.
      // oxlint-disable-next-line twenty/no-navigate-prefer-link
      navigate(getResultPath(result));
    }
  };

  const showSkeleton = hasQuery && loading && results.length === 0;
  const showResults = results.length > 0;

  return (
    <PageCardLayout
      header={
        <PageCardHeader title={t`Search`} icon={<IconSearch size={16} />} />
      }
    >
      <PageTitle title={t`Search`} />
      <StyledScroll>
        <StyledContent>
          <StyledControls>
            <SearchPageInput
              value={query}
              onChange={setQuery}
              onMoveHighlight={moveHighlight}
              onOpenHighlighted={openHighlighted}
            />
            {hasQuery && (
              <SearchPageFilters
                counts={counts}
                totalCount={totalCount}
                selectedObjectNameSingular={objectNameSingular}
                onSelect={setObjectNameSingular}
              />
            )}
          </StyledControls>

          {showSkeleton && <SearchPageSkeleton />}
          {showResults && (
            <SearchPageResults
              groups={groups}
              results={results}
              highlightedIndex={highlightedIndex}
              getResultPath={getResultPath}
            />
          )}
          {(noResults || !hasQuery) && <SearchPageEmptyState query={query} />}
        </StyledContent>
      </StyledScroll>
    </PageCardLayout>
  );
};

export default SearchPage;
