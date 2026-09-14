import { styled } from '@linaria/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

type EventCardProps = {
  children: React.ReactNode;
  isOpen: boolean;
  // Zone CRM: a note or task card takes the whole timeline width.
  isFullWidth?: boolean;
};

const StyledCardContainer = styled.div<{ isFullWidth: boolean }>`
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  gap: ${themeCssVariables.spacing[2]};
  max-width: ${({ isFullWidth }) => (isFullWidth ? 'none' : '400px')};
  padding: ${themeCssVariables.spacing[2]} 0px ${themeCssVariables.spacing[1]}
    0px;
  width: 100%;

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    max-width: ${({ isFullWidth }) => (isFullWidth ? 'none' : '300px')};
  }
`;

// C33, Marcus 14 September 2026: a note or a task draws its own card, so a
// second box around it was the same border twice with eight pixels between
// them. Full width means an activity, and there the container carries nothing
// of its own: the card opens directly under the row.
const StyledCardInnerContainer = styled.div<{ isFullWidth: boolean }>`
  align-items: flex-start;
  align-self: stretch;
  background: ${({ isFullWidth }) =>
    isFullWidth ? 'none' : themeCssVariables.background.secondary};
  border-color: ${themeCssVariables.border.color.medium};
  border-radius: ${({ isFullWidth }) =>
    isFullWidth ? '0' : themeCssVariables.border.radius.md};
  border-style: ${({ isFullWidth }) => (isFullWidth ? 'none' : 'solid')};
  border-width: 1px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: center;
  overflow: hidden;
  padding: ${({ isFullWidth }) =>
    isFullWidth ? '0' : themeCssVariables.spacing[2]};
`;

export const EventCard = ({
  children,
  isOpen,
  isFullWidth = false,
}: EventCardProps) => {
  return (
    isOpen && (
      <StyledCardContainer isFullWidth={isFullWidth}>
        <StyledCardInnerContainer isFullWidth={isFullWidth}>
          {children}
        </StyledCardInnerContainer>
      </StyledCardContainer>
    )
  );
};
