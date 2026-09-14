import { styled } from '@linaria/react';
import { type IconComponent } from 'twenty-ui/icon';
import { FloatingIconButton } from 'twenty-ui/input';
import { AnimatedContainer } from 'twenty-ui/layout';

// Marcus, 14 September 2026, on Phones and Emails: the value shivered under
// the pointer. The pencil only exists while the row is hovered, and it was
// taking its 30 pixels out of the row's flow, so the value was pushed aside
// the moment the mouse arrived; if that push moved the value out from under
// the pointer, the hover ended, the pencil went, the value came back, and the
// row ticked back and forth for as long as the mouse rested there.
//
// So the pencil floats at the end of the row instead of standing in it. The
// value is laid out as though the pencil were not there, which is what it
// looks like when nobody is hovering, and nothing can move.
const StyledInlineCellButtonContainer = styled.div`
  align-items: center;
  display: flex;
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
`;

export const RecordInlineCellButton = ({
  Icon,
  onClick,
}: {
  Icon: IconComponent;
  onClick?: () => void;
}) => {
  return (
    <AnimatedContainer>
      <StyledInlineCellButtonContainer onClick={onClick}>
        <FloatingIconButton
          size="small"
          Icon={Icon}
          data-testid="inline-cell-edit-mode-container"
        />
      </StyledInlineCellButtonContainer>
    </AnimatedContainer>
  );
};
