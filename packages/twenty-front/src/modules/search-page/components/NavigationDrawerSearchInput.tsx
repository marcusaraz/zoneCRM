import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type ChangeEvent, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { IconSearch } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { SEARCH_PAGE_QUERY_PARAM } from '@/search-page/constants/SearchPageQueryParam';
import { getSearchPagePath } from '@/search-page/utils/getSearchPagePath';

const StyledField = styled.label`
  align-items: center;
  background: ${themeCssVariables.background.transparent.light};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  cursor: text;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  margin-bottom: ${themeCssVariables.spacing[3]};
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]};

  &:focus-within {
    background: ${themeCssVariables.background.primary};
    border-color: ${themeCssVariables.border.color.blue};
  }
`;

const StyledIcon = styled.span`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  flex-shrink: 0;
`;

const StyledInput = styled.input`
  background: transparent;
  border: none;
  color: ${themeCssVariables.font.color.primary};
  font-family: ${themeCssVariables.font.family};
  font-size: ${themeCssVariables.font.size.md};
  min-width: 0;
  outline: none;
  padding: ${themeCssVariables.spacing[1]} 0;
  width: 100%;

  &::placeholder {
    color: ${themeCssVariables.font.color.light};
  }
`;

/**
 * The search box, always where it was left.
 *
 * Search used to be a button that opened an empty page waiting to be typed
 * into. The box sits in the drawer instead, so a search starts from wherever
 * you already are and the results fill the screen you were looking at.
 */
export const NavigationDrawerSearchInput = () => {
  const { t } = useLingui();
  const navigate = useNavigate();
  const location = useLocation();
  const inputRef = useRef<HTMLInputElement>(null);

  const isOnSearchPage = location.pathname === AppPath.SearchPage;
  const queryInAddress = isOnSearchPage
    ? (new URLSearchParams(location.search).get(SEARCH_PAGE_QUERY_PARAM) ?? '')
    : '';

  const [value, setValue] = useState(queryInAddress);

  // Leaving search empties the box; arriving with a search in the address fills
  // it, so the box and the results never disagree.
  useEffect(() => {
    setValue(queryInAddress);
  }, [queryInAddress]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value;

    setValue(nextValue);

    // The first letter opens the results; the rest of the word replaces them,
    // so leaving search takes one press of the back button rather than one per
    // letter typed.
    // oxlint-disable-next-line twenty/no-navigate-prefer-link
    navigate(getSearchPagePath({ query: nextValue }), {
      replace: isOnSearchPage,
    });
  };

  return (
    <StyledField>
      <StyledIcon>
        <IconSearch size={16} />
      </StyledIcon>
      <StyledInput
        ref={inputRef}
        type="text"
        autoComplete="off"
        spellCheck={false}
        value={value}
        placeholder={t`Search`}
        aria-label={t`Search`}
        onChange={handleChange}
      />
    </StyledField>
  );
};
