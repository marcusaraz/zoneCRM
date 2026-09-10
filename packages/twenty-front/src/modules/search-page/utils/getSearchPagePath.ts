import { AppPath } from 'twenty-shared/types';

import { SEARCH_PAGE_QUERY_PARAM } from '@/search-page/constants/SearchPageQueryParam';
import { SEARCH_PAGE_TYPE_PARAM } from '@/search-page/constants/SearchPageTypeParam';

// The address carries the search, so a result list can be kept open in a tab,
// sent to a colleague, or come back unchanged after a reload.
export const getSearchPagePath = ({
  query,
  objectNameSingular,
}: {
  query?: string;
  objectNameSingular?: string | null;
} = {}): string => {
  const searchParams = new URLSearchParams();

  if (query !== undefined && query.trim() !== '') {
    searchParams.set(SEARCH_PAGE_QUERY_PARAM, query.trim());
  }

  if (objectNameSingular !== undefined && objectNameSingular !== null) {
    searchParams.set(SEARCH_PAGE_TYPE_PARAM, objectNameSingular);
  }

  const queryString = searchParams.toString();

  return queryString === ''
    ? AppPath.SearchPage
    : `${AppPath.SearchPage}?${queryString}`;
};
