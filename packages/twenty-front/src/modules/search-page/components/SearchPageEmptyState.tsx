import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledContainer = styled.div`
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[8]} ${themeCssVariables.spacing[4]};
`;

const StyledHeadline = styled.p`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.lg};
  font-weight: ${themeCssVariables.font.weight.medium};
  margin: 0;
`;

const StyledHint = styled.p`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.md};
  line-height: ${themeCssVariables.text.lineHeight.md};
  margin: 0;
  max-width: 52ch;
`;

// Two dead ends worth telling apart: nothing asked, and nothing found. Neither
// is a blank page, and the second says what to try next.
export const SearchPageEmptyState = ({ query }: { query: string }) => {
  const { t } = useLingui();
  const hasQuery = query.trim() !== '';

  if (!hasQuery) {
    return (
      <StyledContainer>
        <StyledHeadline>{t`Start typing`}</StyledHeadline>
        <StyledHint>
          {t`Search runs across people, companies, notes, tasks and everything else in the workspace. A phone number, part of an email address or a few letters of a name are all enough.`}
        </StyledHint>
      </StyledContainer>
    );
  }

  return (
    <StyledContainer>
      <StyledHeadline>{t`Nothing matches "${query}"`}</StyledHeadline>
      <StyledHint>
        {t`Try fewer words, or a different part of the name. Numbers match however they were written down, so the last few digits of a phone number often work better than the whole thing.`}
      </StyledHint>
    </StyledContainer>
  );
};
