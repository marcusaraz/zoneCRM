import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { type SearchPageCount } from '@/search-page/hooks/useSearchPageResults';

const StyledRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledTab = styled.button<{ isActive: boolean }>`
  align-items: center;
  background: ${({ isActive }) =>
    isActive
      ? themeCssVariables.background.invertedPrimary
      : themeCssVariables.background.primary};
  border: 1px solid
    ${({ isActive }) =>
      isActive
        ? themeCssVariables.background.invertedPrimary
        : themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.pill};
  color: ${({ isActive }) =>
    isActive
      ? themeCssVariables.font.color.inverted
      : themeCssVariables.font.color.secondary};
  cursor: pointer;
  display: flex;
  font-family: ${themeCssVariables.font.family};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[3]};
  white-space: nowrap;

  &:hover {
    border-color: ${({ isActive }) =>
      isActive
        ? themeCssVariables.background.invertedPrimary
        : themeCssVariables.border.color.strong};
  }

  &:focus-visible {
    outline: 2px solid ${themeCssVariables.border.color.blue};
    outline-offset: 2px;
  }
`;

const StyledCount = styled.span<{ isActive: boolean }>`
  color: ${({ isActive }) =>
    isActive
      ? themeCssVariables.font.color.inverted
      : themeCssVariables.font.color.light};
  font-variant-numeric: tabular-nums;
`;

type SearchPageFiltersProps = {
  counts: SearchPageCount[];
  totalCount: number;
  selectedObjectNameSingular: string | null;
  onSelect: (objectNameSingular: string | null) => void;
};

// One tab per kind of record that actually matched, counted from the unfiltered
// search so the numbers stay still when a tab is picked. Kinds that matched
// nothing are not offered, since a tab that leads to an empty list is a dead end.
export const SearchPageFilters = ({
  counts,
  totalCount,
  selectedObjectNameSingular,
  onSelect,
}: SearchPageFiltersProps) => {
  const { t } = useLingui();

  if (counts.length <= 1) {
    return null;
  }

  return (
    <StyledRow role="tablist" aria-label={t`Filter results by type`}>
      <StyledTab
        type="button"
        role="tab"
        aria-selected={selectedObjectNameSingular === null}
        isActive={selectedObjectNameSingular === null}
        onClick={() => onSelect(null)}
      >
        {t`Everything`}
        <StyledCount isActive={selectedObjectNameSingular === null}>
          {totalCount}
        </StyledCount>
      </StyledTab>
      {counts.map((count) => {
        const isActive =
          selectedObjectNameSingular === count.objectNameSingular;

        return (
          <StyledTab
            key={count.objectNameSingular}
            type="button"
            role="tab"
            aria-selected={isActive}
            isActive={isActive}
            onClick={() => onSelect(isActive ? null : count.objectNameSingular)}
          >
            {count.objectLabelPlural}
            <StyledCount isActive={isActive}>{count.count}</StyledCount>
          </StyledTab>
        );
      })}
    </StyledRow>
  );
};
