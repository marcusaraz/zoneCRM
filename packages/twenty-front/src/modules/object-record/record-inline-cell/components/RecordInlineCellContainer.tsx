import { styled } from '@linaria/react';
import { useContext } from 'react';
import { FieldDescriptionTooltip } from '@/object-record/record-field/ui/components/FieldDescriptionTooltip';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { useFieldFocus } from '@/object-record/record-field/ui/hooks/useFieldFocus';
import { RecordInlineCellValue } from '@/object-record/record-inline-cell/components/RecordInlineCellValue';
import { getRecordFieldInputInstanceId } from '@/object-record/utils/getRecordFieldInputId';

import { assertFieldMetadata } from '@/object-record/record-field/ui/types/guards/assertFieldMetadata';
import { isFieldText } from '@/object-record/record-field/ui/types/guards/isFieldText';
import {
  AppTooltip,
  OverflowingTextWithTooltip,
  TooltipDelay,
} from 'twenty-ui/surfaces';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { useRecordInlineCellContext } from './RecordInlineCellContext';

const StyledIconContainer = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  width: 16px;

  svg {
    align-items: center;
    display: flex;
    height: 16px;
    justify-content: center;
    width: 16px;
  }
`;

// C23, measured off the Stitch person record Marcus sent on 14 September 2026.
// The label sits against the left edge and its value against the right one,
// with the gap between them doing the work a column rule would otherwise do:
//
//     PHONE                              +1 (415) 890-2341
//     EMAIL            elena.rostova@apexmobility.io
//
// So the label takes only the width of its own word and never shrinks, and
// the value takes everything left over and is pushed to the far end of it.
const StyledLabelAndIconContainer = styled.div<{ stacked?: boolean }>`
  align-items: center;
  align-self: flex-start;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  flex-shrink: 0;
  gap: ${themeCssVariables.spacing[1]};
  height: ${({ stacked }) => (stacked ? 'auto' : '24px')};
  min-height: ${({ stacked }) => (stacked ? '24px' : 'auto')};
`;

const StyledValueContainer = styled.div<{
  readonly: boolean;
  stacked?: boolean;
}>`
  display: flex;
  justify-content: ${({ stacked }) => (stacked ? 'flex-end' : 'flex-start')};
  min-width: 0;
  position: relative;
  text-align: ${({ stacked }) => (stacked ? 'right' : 'left')};
  user-select: text;
  width: 100%;

  // Body type, MASTER.md: 15px on a 13px root. The drawing sets the value
  // larger than its label, which is the question Marcus had open: it is the
  // shape of the label, not its size, that tells the two apart.
  font-size: ${({ stacked }) => (stacked ? '1.15rem' : 'inherit')};
`;

const StyledLabelContainer = styled.div<{ width?: number; stacked?: boolean }>`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  width: ${({ width, stacked }) =>
    stacked ? 'auto' : width !== undefined ? `${width}px` : 'auto'};

  // Label type, MASTER.md: 12px, 600, uppercase, 0.04em, which is what the
  // drawing sets. The label shares a line with its value, so it is told apart
  // by its shape rather than by sitting somewhere else.
  font-weight: ${({ stacked }) => (stacked ? '600' : 'inherit')};
  letter-spacing: ${({ stacked }) => (stacked ? '0.04em' : 'normal')};
  text-transform: ${({ stacked }) => (stacked ? 'uppercase' : 'none')};
`;

const StyledInlineCellBaseContainer = styled.div<{
  readonly: boolean;
  stacked?: boolean;
}>`
  align-items: center;
  box-sizing: border-box;
  cursor: ${({ readonly }) => (readonly ? 'default' : 'pointer')};
  display: flex;
  flex-direction: row;
  gap: ${({ stacked }) =>
    stacked ? themeCssVariables.spacing[2] : themeCssVariables.spacing[1]};
  height: fit-content;
  user-select: none;
  width: 100%;

  // Ten above and ten below, with the hairline the card draws between rows
  // falling exactly halfway between one field and the next.
  padding: ${({ stacked }) => (stacked ? '10px 0' : '0')};
`;

export const StyledSkeletonDiv = styled.div`
  height: 24px;
`;

export const RecordInlineCellContainer = () => {
  const { readonly, IconLabel, label, labelWidth, showLabel, isStacked } =
    useRecordInlineCellContext();
  const { theme } = useContext(ThemeContext);

  const { recordId, fieldDefinition, onMouseEnter, onMouseLeave, anchorId } =
    useContext(FieldContext);

  if (isFieldText(fieldDefinition)) {
    assertFieldMetadata(FieldMetadataType.TEXT, isFieldText, fieldDefinition);
  }

  const { setIsFocused } = useFieldFocus();

  const handleContainerMouseEnter = () => {
    if (!readonly) {
      setIsFocused(true);
    }
    onMouseEnter?.();
  };

  const handleContainerMouseLeave = () => {
    if (!readonly) {
      setIsFocused(false);
    }
    onMouseLeave?.();
  };

  const labelId = `label-${getRecordFieldInputInstanceId({
    recordId,
    fieldName: fieldDefinition?.metadata?.fieldName,
  })}`;

  return (
    <StyledInlineCellBaseContainer
      readonly={readonly ?? false}
      stacked={isStacked}
      onMouseEnter={handleContainerMouseEnter}
      onMouseLeave={handleContainerMouseLeave}
    >
      {(IconLabel || label) && (
        <StyledLabelAndIconContainer
          stacked={isStacked}
          id={!showLabel ? labelId : undefined}
        >
          {/* The record page's label already holds its own column, so the icon
              that told a label from its value in a narrow panel has nothing
              left to do. */}
          {IconLabel && isStacked !== true && (
            <StyledIconContainer>
              <IconLabel stroke={theme.icon.stroke.sm} />
            </StyledIconContainer>
          )}
          {showLabel && (
            <StyledLabelContainer width={labelWidth} stacked={isStacked}>
              <FieldDescriptionTooltip
                label={label}
                description={fieldDefinition?.metadata?.description}
                fallback={
                  <OverflowingTextWithTooltip
                    text={label}
                    displayedMaxRows={1}
                  />
                }
              />
            </StyledLabelContainer>
          )}
          {/* TODO: Displaying Tooltips on the board is causing performance issues https://react-tooltip.com/docs/examples/render */}
          {!showLabel && (
            <AppTooltip
              anchorSelect={`#${labelId}`}
              title={label}
              interactive
              noArrow
              place="bottom"
              positionStrategy="fixed"
              delay={TooltipDelay.shortDelay}
            />
          )}
        </StyledLabelAndIconContainer>
      )}
      <StyledValueContainer
        readonly={readonly ?? false}
        stacked={isStacked}
        id={anchorId}
      >
        <RecordInlineCellValue />
      </StyledValueContainer>
    </StyledInlineCellBaseContainer>
  );
};
