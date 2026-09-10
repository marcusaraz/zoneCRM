import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

import { SEARCH_PAGE_QUERY_PARAM } from '@/search-page/constants/SearchPageQueryParam';
import { SEARCH_PAGE_TYPE_PARAM } from '@/search-page/constants/SearchPageTypeParam';

/**
 * The search lives in the address, not in a state atom.
 *
 * That is what makes a list of results something you can keep in a tab, send to
 * someone, or come back to after opening one of them. Each keystroke replaces
 * the entry rather than adding one, so the back button leaves the search in one
 * step instead of retyping it backwards.
 */
export const useSearchPageState = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const query = searchParams.get(SEARCH_PAGE_QUERY_PARAM) ?? '';
  const objectNameSingular = searchParams.get(SEARCH_PAGE_TYPE_PARAM);

  const setQuery = useCallback(
    (nextQuery: string) => {
      setSearchParams(
        (previous) => {
          const next = new URLSearchParams(previous);

          if (nextQuery === '') {
            next.delete(SEARCH_PAGE_QUERY_PARAM);
          } else {
            next.set(SEARCH_PAGE_QUERY_PARAM, nextQuery);
          }

          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const setObjectNameSingular = useCallback(
    (nextObjectNameSingular: string | null) => {
      setSearchParams(
        (previous) => {
          const next = new URLSearchParams(previous);

          if (nextObjectNameSingular === null) {
            next.delete(SEARCH_PAGE_TYPE_PARAM);
          } else {
            next.set(SEARCH_PAGE_TYPE_PARAM, nextObjectNameSingular);
          }

          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  return { query, objectNameSingular, setQuery, setObjectNameSingular };
};
