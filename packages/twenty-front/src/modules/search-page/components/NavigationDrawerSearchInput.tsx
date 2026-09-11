import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type ChangeEvent } from 'react';
import { IconSearch } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { SEARCH_PAGE_INPUT_ID } from '@/search-page/constants/SearchPageInputId';
import { useOpenSearchResultsInSidePanel } from '@/search-page/hooks/useOpenSearchResultsInSidePanel';
import { sidePanelSearchState } from '@/side-panel/states/sidePanelSearchState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

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
 * Typing opens the results beside whatever is already on screen, so looking
 * someone up costs nothing: the record being read stays where it is, and an
 * empty box puts the panel away again.
 */
export const NavigationDrawerSearchInput = () => {
  const { t } = useLingui();
  const sidePanelSearch = useAtomStateValue(sidePanelSearchState);
  const { search } = useOpenSearchResultsInSidePanel();

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    search(event.target.value);
  };

  return (
    <StyledField>
      <StyledIcon>
        <IconSearch size={16} />
      </StyledIcon>
      <StyledInput
        id={SEARCH_PAGE_INPUT_ID}
        type="text"
        autoComplete="off"
        spellCheck={false}
        value={sidePanelSearch}
        placeholder={t`Search`}
        aria-label={t`Search`}
        onChange={handleChange}
      />
    </StyledField>
  );
};
