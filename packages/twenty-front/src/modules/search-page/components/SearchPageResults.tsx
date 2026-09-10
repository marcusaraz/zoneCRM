import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { SearchPageResultRow } from '@/search-page/components/SearchPageResultRow';
import { SEARCH_PAGE_RESULT_LIMIT } from '@/search-page/constants/SearchPageResultLimit';
import {
  type SearchPageGroup,
  type SearchPageResult,
} from '@/search-page/hooks/useSearchPageResults';

const StyledGroups = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[6]};
`;

const StyledGroup = styled.section`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledHeading = styled.h2`
  align-items: baseline;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  gap: ${themeCssVariables.spacing[2]};
  letter-spacing: 0.04em;
  margin: 0;
  padding: 0 ${themeCssVariables.spacing[4]};
  text-transform: uppercase;
`;

const StyledCount = styled.span`
  font-variant-numeric: tabular-nums;
  font-weight: ${themeCssVariables.font.weight.regular};
`;

const StyledRows = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledCapNote = styled.p`
  color: ${themeCssVariables.font.color.light};
  font-size: ${themeCssVariables.font.size.sm};
  margin: 0;
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[4]} 0;
`;

type SearchPageResultsProps = {
  groups: SearchPageGroup[];
  results: SearchPageResult[];
  highlightedIndex: number;
  getResultPath: (result: SearchPageResult) => string;
};

// Results keep the kind of record they belong to. A page of names with nothing
// saying which are people and which are companies is a page you have to read
// twice.
export const SearchPageResults = ({
  groups,
  results,
  highlightedIndex,
  getResultPath,
}: SearchPageResultsProps) => {
  const { t } = useLingui();
  const highlightedResult = results[highlightedIndex];

  return (
    <StyledGroups>
      {groups.map((group) => (
        <StyledGroup key={group.objectNameSingular}>
          <StyledHeading>
            {group.objectLabelPlural}
            <StyledCount>{group.results.length}</StyledCount>
          </StyledHeading>
          <StyledRows>
            {group.results.map((result, index) => (
              <SearchPageResultRow
                key={result.id}
                result={result}
                to={getResultPath(result)}
                isStriped={index % 2 === 1}
                isHighlighted={highlightedResult?.id === result.id}
              />
            ))}
          </StyledRows>
          {group.results.length >= SEARCH_PAGE_RESULT_LIMIT && (
            <StyledCapNote>
              {t`Showing the first ${SEARCH_PAGE_RESULT_LIMIT}. Add a word to narrow it down.`}
            </StyledCapNote>
          )}
        </StyledGroup>
      ))}
    </StyledGroups>
  );
};
