import { styled } from '@linaria/react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { getAppPath } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { SearchPageEmptyState } from '@/search-page/components/SearchPageEmptyState';
import { SearchPageFilters } from '@/search-page/components/SearchPageFilters';
import { SearchPageResults } from '@/search-page/components/SearchPageResults';
import { SearchPageSkeleton } from '@/search-page/components/SearchPageSkeleton';
import {
  type SearchPageResult,
  useSearchPageResults,
} from '@/search-page/hooks/useSearchPageResults';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[5]};
  width: 100%;
`;

type SearchResultsViewProps = {
  query: string;
  objectNameSingular: string | null;
  onSelectObject: (objectNameSingular: string | null) => void;
};

/**
 * What a search found, wherever it is being shown.
 *
 * The words are typed somewhere else, in the box in the drawer or the one on a
 * phone screen, so this only ever reads them. The keys that walk the results are
 * listened for on the window for the same reason: the caret stays in the box.
 */
export const SearchResultsView = ({
  query,
  objectNameSingular,
  onSelectObject,
}: SearchResultsViewProps) => {
  const navigate = useNavigate();
  const { groups, results, counts, totalCount, loading, hasQuery, noResults } =
    useSearchPageResults({ query, objectNameSingular });

  const [highlightedIndex, setHighlightedIndex] = useState(0);

  // A new set of results starts at the top rather than wherever the last one
  // happened to be.
  useEffect(() => {
    setHighlightedIndex(0);
  }, [query, objectNameSingular]);

  const getResultPath = (result: SearchPageResult) =>
    getAppPath(AppPath.RecordShowPage, {
      objectNameSingular: result.objectNameSingular,
      objectRecordId: result.recordId,
    });

  useEffect(() => {
    const moveHighlight = (offset: number) => {
      if (results.length === 0) {
        return;
      }

      setHighlightedIndex((previous) => {
        const next = previous + offset;

        if (next < 0) {
          return results.length - 1;
        }

        return next > results.length - 1 ? 0 : next;
      });
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        moveHighlight(1);
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault();
        moveHighlight(-1);
      }

      if (event.key === 'Enter') {
        const result = results[highlightedIndex];

        if (result !== undefined) {
          event.preventDefault();
          // Enter follows the same address the highlighted row points at.
          // oxlint-disable-next-line twenty/no-navigate-prefer-link
          navigate(getResultPath(result));
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const showSkeleton = hasQuery && loading && results.length === 0;

  return (
    <StyledContainer>
      {hasQuery && (
        <SearchPageFilters
          counts={counts}
          totalCount={totalCount}
          selectedObjectNameSingular={objectNameSingular}
          onSelect={onSelectObject}
        />
      )}
      {showSkeleton && <SearchPageSkeleton />}
      {results.length > 0 && (
        <SearchPageResults
          groups={groups}
          results={results}
          highlightedIndex={highlightedIndex}
          getResultPath={getResultPath}
        />
      )}
      {(noResults || !hasQuery) && <SearchPageEmptyState query={query} />}
    </StyledContainer>
  );
};
