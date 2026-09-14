import { styled } from '@linaria/react';

import { TIMELINE_ICON_SLOT_SIZE } from '@/activities/timeline-activities/constants/TimelineIconSlotSize';
import { themeCssVariables } from 'twenty-ui/theme-constants';

export const StyledEventRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  width: 100%;
`;

export const StyledEventRowContainer = styled.div`
  align-items: baseline;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: flex-start;
  min-height: ${TIMELINE_ICON_SLOT_SIZE}px;
`;

export const StyledEventRowContent = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  min-width: 0;
  overflow: hidden;
`;

export const StyledEventRowLinkedRecord = styled.span`
  color: ${themeCssVariables.font.color.primary};
  cursor: pointer;
  overflow: hidden;
  text-decoration: underline;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
`;

// C33, Marcus 14 September 2026: the name is said once, on the row that already
// carries who did it and what they did. The card under it opens directly below
// and shows the detail, without repeating the name as a heading.
export const StyledEventRowActivityName = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-weight: ${themeCssVariables.font.weight.medium};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;
