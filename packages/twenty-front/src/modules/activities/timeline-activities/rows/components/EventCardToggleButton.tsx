import { TIMELINE_ROW_LINE_HEIGHT } from '@/activities/timeline-activities/constants/TimelineRowLineHeight';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { IconButton } from 'twenty-ui/input';
import { IconChevronDown, IconChevronUp } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type EventCardToggleButtonProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
};

// As tall as the line it sits on, and aligned to the top of the row rather than
// to its text: a flex item with no text of its own baselines on its bottom
// edge, which pulled every word on the row down by 2px and left the rows with
// no chevron sitting 2px higher than the rows with one.
const StyledButtonContainer = styled.div`
  align-items: center;
  align-self: flex-start;
  border-radius: ${themeCssVariables.border.radius.sm};
  display: flex;
  flex-shrink: 0;
  height: ${TIMELINE_ROW_LINE_HEIGHT}px;
`;

export const EventCardToggleButton = ({
  isOpen,
  setIsOpen,
}: EventCardToggleButtonProps) => {
  const { t } = useLingui();

  return (
    // The skill Marcus asked be used says an interactive control carrying an
    // icon needs an accessible name and must expose its state. It had a name;
    // now it says whether it is open, so a screen reader is told what the
    // chevron is telling everyone else.
    <StyledButtonContainer aria-expanded={isOpen}>
      <IconButton
        Icon={isOpen ? IconChevronUp : IconChevronDown}
        onClick={() => setIsOpen(!isOpen)}
        ariaLabel={isOpen ? t`Collapse details` : t`Expand details`}
        size="small"
        variant="secondary"
      />
    </StyledButtonContainer>
  );
};
