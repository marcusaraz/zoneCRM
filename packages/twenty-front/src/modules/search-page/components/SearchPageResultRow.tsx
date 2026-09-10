import { css } from '@linaria/core';
import { styled } from '@linaria/react';
import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Avatar } from 'twenty-ui/data-display';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { type SearchPageResult } from '@/search-page/hooks/useSearchPageResults';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

const StyledRow = styled(Link)`
  align-items: center;
  border-left: 2px solid transparent;
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  gap: ${themeCssVariables.spacing[3]};
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[4]};
  text-decoration: none;
  width: 100%;

  &:hover {
    background: ${themeCssVariables.background.tertiary};
  }

  &:focus-visible {
    outline: 2px solid ${themeCssVariables.border.color.blue};
    outline-offset: -2px;
  }
`;

// Alternating bands, the same way the record tables read.
const stripedClass = css`
  background: ${themeCssVariables.background.secondary};
`;

// Where the keyboard is. The bar on the left survives the hover colour, so the
// place you are does not move when the pointer wanders over the list.
const highlightedClass = css`
  background: ${themeCssVariables.background.transparent.blue};
  border-left-color: ${themeCssVariables.border.color.blue};
`;

const StyledText = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  min-width: 0;
`;

const StyledLabel = styled.span`
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledObjectLabel = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
`;

type SearchPageResultRowProps = {
  result: SearchPageResult;
  to: string;
  isStriped: boolean;
  isHighlighted: boolean;
};

// A result is a link, not a button, so it can be opened in a new tab the way any
// other address can.
export const SearchPageResultRow = ({
  result,
  to,
  isStriped,
  isHighlighted,
}: SearchPageResultRowProps) => {
  const rowRef = useRef<HTMLAnchorElement>(null);

  // Walking the list with the arrows should not walk it off the screen.
  useEffect(() => {
    if (isHighlighted) {
      rowRef.current?.scrollIntoView({ block: 'nearest' });
    }
  }, [isHighlighted]);

  return (
    <StyledRow
      ref={rowRef}
      to={to}
      className={[
        isStriped ? stripedClass : '',
        isHighlighted ? highlightedClass : '',
      ]
        .filter((className) => className !== '')
        .join(' ')}
    >
      <Avatar
        type={result.avatarType}
        avatarUrl={getAbsoluteImageUrl(result.imageUrl)}
        placeholderColorSeed={result.recordId}
        placeholder={result.label}
        size="md"
      />
      <StyledText>
        <StyledLabel>{result.label}</StyledLabel>
        <StyledObjectLabel>{result.objectLabelSingular}</StyledObjectLabel>
      </StyledText>
    </StyledRow>
  );
};
