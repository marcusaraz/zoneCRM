import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { getSearchPagePath } from '@/search-page/utils/getSearchPagePath';

// Every way into search leads to the same place: the main screen, at an address
// that can be kept, shared and returned to.
export const useOpenSearchPage = () => {
  const navigate = useNavigate();

  const openSearchPage = useCallback(
    (query?: string) => {
      navigate(getSearchPagePath({ query }));
    },
    [navigate],
  );

  return { openSearchPage };
};
