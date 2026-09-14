import { styled } from '@linaria/react';

import { TIMELINE_ROW_LINE_HEIGHT } from '@/activities/timeline-activities/constants/TimelineRowLineHeight';
import { themeCssVariables } from 'twenty-ui/theme-constants';

export const StyledEventRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  width: 100%;
`;

// 14px above and below each entry, measured off the Stitch person record
// (pm/briefs/zone-crm-desktop/person-record.html); the hairline between entries
// falls halfway. That padding is on the row's outer container now, not here:
// with it in both places the entry carried 22px of air at the top and the disc,
// which is beside the outer container, could not be lined up with the text
// inside this one. One place for the rhythm, one stated line height, and the
// disc has something to be centred on.
export const StyledEventRowContainer = styled.div`
  align-items: baseline;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: flex-start;
  line-height: ${TIMELINE_ROW_LINE_HEIGHT}px;
`;

// Takes the room left between the date column and whatever ends the row, so
// that a row which ends in a chevron and a row which does not both start their
// text in the same place.
export const StyledEventRowContent = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
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
