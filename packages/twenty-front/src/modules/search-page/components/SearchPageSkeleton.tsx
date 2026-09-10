import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledList = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[3]};
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[4]};
`;

const StyledCircle = styled.div`
  background: ${themeCssVariables.background.tertiary};
  border-radius: ${themeCssVariables.border.radius.rounded};
  flex-shrink: 0;
  height: 24px;
  width: 24px;
`;

const StyledLines = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledLine = styled.div<{ width: number }>`
  background: ${themeCssVariables.background.tertiary};
  border-radius: ${themeCssVariables.border.radius.xs};
  height: 10px;
  width: ${({ width }) => width}px;
`;

// Rows in the shape of the answer, so the page does not jump when it arrives.
export const SearchPageSkeleton = () => (
  <StyledList aria-hidden="true">
    {[0, 1, 2, 3, 4].map((row) => (
      <StyledRow key={row}>
        <StyledCircle />
        <StyledLines>
          <StyledLine width={180 - row * 18} />
          <StyledLine width={64} />
        </StyledLines>
      </StyledRow>
    ))}
  </StyledList>
);
