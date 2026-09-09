import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledTr = styled.div<{
  isDragging: boolean;
}>`
  border-bottom: ${({ isDragging }) =>
    isDragging ? `1px solid ${themeCssVariables.border.color.medium}` : 'none'};
  border-top: ${({ isDragging }) =>
    isDragging ? `1px solid ${themeCssVariables.border.color.medium}` : 'none'};

  display: flex;
  flex-direction: row;

  position: relative;

  /* Zone CRM: zebra rows. Cells paint their own background so the sticky
     columns stay opaque; every second row paints them light grey instead,
     unless the row is selected. */
  &[data-striped='true']:not([data-selected='true']) {
    div.table-cell,
    div.table-cell-0-0 {
      background-color: ${themeCssVariables.background.secondary};
    }
  }

  &[data-focused='true'],
  &[data-active='true'] {
    div.table-cell,
    div.table-cell-0-0 {
      &:not(:first-of-type) {
        background-color: ${themeCssVariables.accent.quaternary};
        border-bottom: 1px solid ${themeCssVariables.border.color.medium};
        border-color: ${themeCssVariables.border.color.medium};
      }
      &:nth-of-type(2) {
        border-left: 1px solid ${themeCssVariables.border.color.medium};

        margin-left: -1px;

        div {
          margin-left: -1px;
        }
      }
      &:last-of-type {
        border-radius: 0 ${themeCssVariables.border.radius.sm}
          ${themeCssVariables.border.radius.sm} 0;
        border-right: 1px solid ${themeCssVariables.border.color.medium};
      }
    }
  }
`;

export const RecordTableRowDiv = StyledTr;
